import { NextResponse } from "next/server";
import { createPlotSchema } from "@/api/schemas/plot.schema";
import { plotService } from "@/services/composition-root";
import type { ApiResponse } from "@/types/api";

type CreatePlotResponse = { id: string };

export async function POST(request: Request) {
  const parsed = createPlotSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<CreatePlotResponse>>({ error: { code: "INVALID_INPUT", message: "Invalid plot data." } }, { status: 400 });
  }

  try {
    const id = await plotService.create(parsed.data);
    return NextResponse.json<ApiResponse<CreatePlotResponse>>({ data: { id } }, { status: 201 });
  } catch (error) {
    console.error("Unable to create plot.", error);
    return NextResponse.json<ApiResponse<CreatePlotResponse>>({ error: { code: "CREATE_FAILED", message: "Unable to create plot." } }, { status: 500 });
  }
}
