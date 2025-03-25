// app/api/token/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Return a static token for development
  return NextResponse.json({ token: "your-local-dummy-token" });
}
