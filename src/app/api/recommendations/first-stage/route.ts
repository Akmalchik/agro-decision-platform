import { NextResponse } from "next/server";
import { z } from "zod";
import type { FirstStageRecommendationResult } from "@/modules/recommendations/domain/first-stage-recommendation";
import { FirstStageRecommendationError } from "@/services/recommendations/first-stage-recommendation.service";
import { firstStageRecommendationService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";

export const runtime = "nodejs";

const requestSchema = z.object({ plotId: z.uuid() });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<FirstStageRecommendationResult>>({ error: { code: "INVALID_INPUT", message: "Invalid plot identifier." } }, { status: 400 });
  }

  try {
    const result = await firstStageRecommendationService.calculate(parsed.data.plotId);
    return NextResponse.json<ApiResponse<FirstStageRecommendationResult>>({ data: result });
  } catch (error) {
    if (error instanceof FirstStageRecommendationError) {
      const status = error.code === "PLOT_NOT_FOUND" ? 404 : 422;
      return NextResponse.json<ApiResponse<FirstStageRecommendationResult>>({ error: { code: error.code, message: error.code } }, { status });
    }
    console.error("Unable to calculate first-stage recommendation.", error);
    return NextResponse.json<ApiResponse<FirstStageRecommendationResult>>({ error: { code: "CALCULATION_FAILED", message: "Recommendation calculation failed." } }, { status: 500 });
  }
}
