import { NextResponse } from "next/server";
import { createPlotSchema } from "@/api/schemas/plot.schema";
import { plotService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";
import { apiError, readJson, requireWriter } from "@/api/http";

export const runtime = "nodejs";

type CreatePlotResponse = { id: string };

export async function POST(request: Request) {
  try {
    requireWriter(request);
    const input = await readJson(request, createPlotSchema);
    const id = await plotService.create(input);
    return NextResponse.json<ApiResponse<CreatePlotResponse>>({ data: { id } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
