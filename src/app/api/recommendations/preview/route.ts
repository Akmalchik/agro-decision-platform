import { plotIdSchema } from "@/api/schemas/plot.schema";
import { apiError, HttpError } from "@/api/http";
import { firstStageRecommendationService } from "@/services/composition-root";
import { FirstStageRecommendationError } from "@/services/recommendations/first-stage-recommendation.service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const parsed = plotIdSchema.safeParse(new URL(request.url).searchParams.get("plotId"));
    if (!parsed.success) throw new HttpError(400, "INVALID_INPUT");
    return Response.json({ data: await firstStageRecommendationService.preview(parsed.data) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof FirstStageRecommendationError) return apiError(new HttpError(error.code === "PLOT_NOT_FOUND" ? 404 : 422, error.code));
    return apiError(error);
  }
}
