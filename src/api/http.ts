import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import type { z } from "zod";

export class HttpError extends Error { constructor(public status: number, public code: string) { super(code); } }
export function requireWriter(request: Request) {
  const expected = process.env.WRITE_ACCESS_KEY;
  if (!expected || expected.length < 32) throw new HttpError(503, "WRITES_NOT_CONFIGURED");
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const supplied = Buffer.from(token), secret = Buffer.from(expected);
  if (supplied.length !== secret.length || !timingSafeEqual(supplied, secret)) throw new HttpError(401, "UNAUTHORIZED");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, "INVALID_ORIGIN");
}
export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") throw new HttpError(415, "JSON_REQUIRED");
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 1000000) throw new HttpError(413, "PAYLOAD_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "INVALID_JSON");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length;
      if (size > 1000000) { await reader.cancel(); throw new HttpError(413, "PAYLOAD_TOO_LARGE"); } chunks.push(part.value); }
    let value: unknown;
    try { value = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new HttpError(400, "INVALID_JSON"); }
    const parsed = schema.safeParse(value);
    if (!parsed.success) throw new HttpError(400, "INVALID_INPUT");
    return parsed.data;
  } finally { reader.releaseLock(); }
}
export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: { code: error.code, message: error.code } }, { status: error.status });
  const known = error as { code?: string; meta?: { code?: string }; message?: string };
  if (known?.code === "P2002" || known?.code === "P2010" && known.meta?.code === "23505") return NextResponse.json({ error: { code: "DUPLICATE_CADASTRAL", message: "DUPLICATE_CADASTRAL" } }, { status: 409 });
  if (known?.message === "INVALID_GEOMETRY") return NextResponse.json({ error: { code: "INVALID_GEOMETRY", message: "INVALID_GEOMETRY" } }, { status: 422 });
  console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: { code: "SERVICE_UNAVAILABLE", message: "SERVICE_UNAVAILABLE" } }, { status: 503 });
}
