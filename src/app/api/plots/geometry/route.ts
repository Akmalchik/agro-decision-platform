import { NextResponse } from "next/server";
import { plotGeometrySchema } from "@/api/schemas/plot.schema";
import type { PlotGeometryMetrics } from "@/gis/domain/plot-geometry-metrics";
import { plotService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";

export async function POST(request: Request) {
  const parsed = plotGeometrySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<PlotGeometryMetrics>>({ error: { code: "INVALID_GEOMETRY", message: "Invalid polygon geometry." } }, { status: 400 });
  }

  const metrics = await plotService.inspectGeometry(parsed.data);
  if (!metrics) {
    return NextResponse.json<ApiResponse<PlotGeometryMetrics>>({ error: { code: "INVALID_GEOMETRY", message: "Invalid polygon geometry." } }, { status: 400 });
  }

  return NextResponse.json<ApiResponse<PlotGeometryMetrics>>({ data: metrics });
}
