import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function GET() {
  return NextResponse.json<ApiResponse<{ status: "ok" }>>({ data: { status: "ok" } });
}
