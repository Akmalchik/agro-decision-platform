import { NextResponse } from "next/server";
import { plotGeometrySchema } from "@/api/schemas/plot.schema";
import type { PlotGeometryMetrics } from "@/gis/domain/plot-geometry-metrics";
import { plotService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";
import { apiError, readJson } from "@/api/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
  const input = await readJson(request, plotGeometrySchema);
  const metrics = await plotService.inspectGeometry(input);
  if (!metrics) {
    return NextResponse.json<ApiResponse<PlotGeometryMetrics>>({ error: { code: "INVALID_GEOMETRY", message: "Invalid polygon geometry." } }, { status: 400 });
  }

  return NextResponse.json<ApiResponse<PlotGeometryMetrics>>({ data: metrics });
  } catch (error) { return apiError(error); }
}
