import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { AppError } from "@/lib/error";

export const config = {
  matcher: ["/api/users/me"],
};

export async function middleware(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("accessToken")?.value;

    const token =
      authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : cookieToken;

    if (!token) {
      throw new AppError("인증이 필요합니다.", 401, "UNAUTHORIZED");
    }

    await verifyAccessToken(token);
    return NextResponse.next();
  } catch (error) {
    const message =
      error instanceof AppError ? error.message : "유효하지 않은 토큰입니다.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message,
        },
      },
      { status: 401 },
    );
  }
}
