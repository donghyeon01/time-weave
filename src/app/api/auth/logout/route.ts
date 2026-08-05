import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth";
import { sha256Hex } from "@/lib/crypto";
import { verifyRefreshToken } from "@/lib/jwt";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { removeRefreshTokenByHash } from "@/services/tokenService";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);

    if (refreshToken) {
      try {
        await verifyRefreshToken(refreshToken);
        await removeRefreshTokenByHash(sha256Hex(refreshToken));
      } catch {
        // 토큰이 만료되었거나 위변조된 경우에도 쿠키는 초기화한다.
      }
    }

    const response = NextResponse.json(
      createSuccessResponse({ message: "로그아웃되었습니다." }),
    );
    clearAuthCookies(response);
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("로그아웃 처리 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
