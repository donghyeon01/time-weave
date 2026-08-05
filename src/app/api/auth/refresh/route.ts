import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getRefreshToken, setAuthCookies } from "@/lib/auth";
import { sha256Hex } from "@/lib/crypto";
import { verifyRefreshToken } from "@/lib/jwt";
import { createSuccessResponse, createErrorResponse } from "@/lib/response";
import { rotateTokenPair } from "@/services/tokenService";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);
    if (!refreshToken) {
      throw new AppError("Refresh Token이 필요합니다.", 401, "UNAUTHORIZED");
    }

    await verifyRefreshToken(refreshToken);
    const tokenHash = sha256Hex(refreshToken);
    const tokens = await rotateTokenPair(tokenHash, request);

    const response = NextResponse.json(
      createSuccessResponse({ accessToken: tokens.accessToken }),
    );
    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("토큰 재발급 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
