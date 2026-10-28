import { NextResponse } from "next/server";
import { z } from "zod";
import type { FirstStageRecommendationResult } from "@/modules/recommendations/domain/first-stage-recommendation";
import { FirstStageRecommendationError } from "@/services/recommendations/first-stage-recommendation.service";
import { firstStageRecommendationService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";
import { apiError, readJson, requireWriter } from "@/api/http";

export const runtime = "nodejs";

const requestSchema = z.object({ plotId: z.uuid() });

export async function POST(request: Request) {
  try {
    requireWriter(request);
    const input = await readJson(request, requestSchema);
    const result = await firstStageRecommendationService.calculate(input.plotId);
    return NextResponse.json<ApiResponse<FirstStageRecommendationResult>>({ data: result });
  } catch (error) {
    if (error instanceof FirstStageRecommendationError) {
      const status = error.code === "PLOT_NOT_FOUND" ? 404 : 422;
      return NextResponse.json<ApiResponse<FirstStageRecommendationResult>>({ error: { code: error.code, message: error.code } }, { status });
    }
    return apiError(error);
  }
}
