import { NextResponse } from "next/server";
import { z } from "zod";
import { plotLookupMethodSchema } from "@/api/schemas/plot.schema";
import type { PlotLookupRecord } from "@/modules/plots/domain/plot-lookup-source";
import { plotService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";

export const runtime = "nodejs";

const querySchema = z.object({ method: plotLookupMethodSchema, value: z.string().trim().min(3).max(100) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ method: url.searchParams.get("method"), value: url.searchParams.get("value") });
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<PlotLookupRecord | null>>({ error: { code: "INVALID_LOOKUP", message: "Invalid lookup query." } }, { status: 400 });
  }

  const record = await plotService.lookup(parsed.data.method, parsed.data.value);
  return NextResponse.json<ApiResponse<PlotLookupRecord | null>>({ data: record });
}
