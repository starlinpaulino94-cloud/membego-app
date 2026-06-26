import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

  // Always allow same-origin (no Origin header) and localhost in dev
  const isAllowed = !origin ||
    (process.env.NODE_ENV === "development" && origin.includes("localhost")) ||
    allowedOrigins.includes(origin);

  if (isAllowed || allowedOrigins.length === 0) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
