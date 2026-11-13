import { NextResponse } from "next/server";
import { sellerInterestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 4000) {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  if (!sellerInterestSchema.safeParse(body).success) {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  return NextResponse.json({ ok: false, code: "not_available" }, { status: 501 });
}
