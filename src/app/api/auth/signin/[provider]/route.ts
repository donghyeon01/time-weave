import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { AppError } from "@/lib/error";
import { setOAuthCookies } from "@/lib/auth";
import {
  buildAuthorizationUrl,
  createCodeChallenge,
  generateCodeVerifier,
} from "@/lib/oauth";
import { type OAuthProvider } from "@/lib/providers";
import { createErrorResponse } from "@/lib/response";

const ALLOWED_PROVIDERS: readonly OAuthProvider[] = ["kakao", "google"];

function isProvider(value: string): value is OAuthProvider {
  return ALLOWED_PROVIDERS.includes(value as OAuthProvider);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await context.params;

    if (!isProvider(provider)) {
      throw new AppError(
        "지원하지 않는 OAuth 제공자입니다.",
        400,
        "INVALID_PROVIDER",
      );
    }

    const state = randomUUID();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = createCodeChallenge(codeVerifier);
    const authUrl = buildAuthorizationUrl(provider, state, codeChallenge);

    const response = NextResponse.redirect(authUrl);
    setOAuthCookies(response, state, codeVerifier);
    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("로그인 요청 처리 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
