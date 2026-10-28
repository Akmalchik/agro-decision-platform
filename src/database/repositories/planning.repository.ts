import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { PILOT_CADASTRAL_NUMBERS } from "../../../prisma/seed-data/piskent-cadastre";
import { planSchema, validatePlanArea, type Plan, type PlotScope, type Submission } from "@/modules/planning/domain";
import { HttpError } from "@/api/http";

// Additive, versioned storage. Existing plots and recommendation tables are never altered.
export const planningTableSql = `CREATE TABLE IF NOT EXISTS smart_ekin_plans_v1 (
  plot_id uuid NOT NULL REFERENCES plots(id) ON DELETE RESTRICT,
  season varchar(4) NOT NULL CHECK (season ~ '^20[0-9]{2}$'),
  mode text NOT NULL CHECK (mode IN ('DEMO', 'USER_PLAN')),
  allocations jsonb NOT NULL CHECK (jsonb_typeof(allocations) = 'array'),
  revision integer NOT NULL CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plot_id, season, mode)
)`;

export async function planningPlots(): Promise<PlotScope[]> {
  const plots = await prisma.plot.findMany({ where: { cadastralNumber: { in: PILOT_CADASTRAL_NUMBERS } },
    select: { id: true, cadastralNumber: true, farmName: true, farmId: true, area: true } });
  return plots.map((plot) => ({ ...plot, area: Number(plot.area), farmId: plot.farmId ?? plot.id }));
}
export async function readPlans(season: string, mode: Plan["mode"]): Promise<{ submissions: Submission[]; storageReady: boolean }> {
  const [exists] = await prisma.$queryRaw<Array<{ exists: boolean }>>`SELECT to_regclass('public.smart_ekin_plans_v1') IS NOT NULL AS "exists"`;
  if (!exists?.exists) return { submissions: [], storageReady: false };
  const rows = await prisma.$queryRaw<Array<{ plotId: string; allocations: unknown; revision: number; updatedAt: Date }>>(Prisma.sql`
    SELECT plot_id AS "plotId", allocations, revision, updated_at AS "updatedAt" FROM smart_ekin_plans_v1
    WHERE season = ${season} AND mode = ${mode}`);
  return { storageReady: true, submissions: rows.map((row) => ({ ...planSchema.parse({ ...row, season, mode }), updatedAt: row.updatedAt.toISOString() })) };
}
export async function savePlan(plan: Plan): Promise<Submission> {
  const scope = await planningPlots();
  const plot = scope.find((item) => item.id === plan.plotId);
  if (!plot) throw new HttpError(404, "PLOT_OUTSIDE_PLANNING_SCOPE");
  try { validatePlanArea(plan, plot); } catch { throw new HttpError(422, "AREA_EXCEEDS_PLOT"); }
  return prisma.$transaction(async (transaction) => {
    // Initialized only on an explicitly authorized save; reads never perform DDL.
    await transaction.$executeRawUnsafe(planningTableSql);
    await transaction.$executeRawUnsafe('REVOKE ALL ON smart_ekin_plans_v1 FROM PUBLIC');
    await transaction.$executeRawUnsafe('ALTER TABLE smart_ekin_plans_v1 ENABLE ROW LEVEL SECURITY');
    const rows = await transaction.$queryRaw<Array<{ revision: number; updatedAt: Date }>>(Prisma.sql`
      INSERT INTO smart_ekin_plans_v1 (plot_id, season, mode, allocations, revision)
      SELECT ${plan.plotId}::uuid, ${plan.season}, ${plan.mode}, ${JSON.stringify(plan.allocations)}::jsonb, 1
      WHERE ${plan.revision} = 0
      ON CONFLICT (plot_id, season, mode) DO NOTHING RETURNING revision, updated_at AS "updatedAt"`);
    let saved = rows[0];
    if (!saved && plan.revision > 0) {
      const updates = await transaction.$queryRaw<Array<{ revision: number; updatedAt: Date }>>(Prisma.sql`
        UPDATE smart_ekin_plans_v1 SET allocations = ${JSON.stringify(plan.allocations)}::jsonb,
        revision = revision + 1, updated_at = now()
        WHERE plot_id = ${plan.plotId}::uuid AND season = ${plan.season} AND mode = ${plan.mode} AND revision = ${plan.revision}
        RETURNING revision, updated_at AS "updatedAt"`);
      saved = updates[0];
    }
    if (!saved) throw new HttpError(409, "PLAN_CHANGED_RELOAD");
    return { ...plan, revision: saved.revision, updatedAt: saved.updatedAt.toISOString() };
  });
}
