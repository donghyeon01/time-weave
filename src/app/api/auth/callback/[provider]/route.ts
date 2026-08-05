import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { clearOAuthCookies, setAuthCookies, getOAuthCookies } from "@/lib/auth";
import { exchangeCodeForToken, fetchUserInfo } from "@/lib/oauth";
import { getMongoose } from "@/lib/db";
import { findOrCreateUser } from "@/services/userService";
import { createTokenPair } from "@/services/tokenService";
import { type OAuthProvider } from "@/lib/providers";

const ALLOWED_PROVIDERS: readonly OAuthProvider[] = ["kakao", "google"];

function isProvider(value: string): value is OAuthProvider {
  return ALLOWED_PROVIDERS.includes(value as OAuthProvider);
}

function buildErrorRedirect(
  request: NextRequest,
  message: string,
): NextResponse {
  const url = new URL("/", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await context.params;

    if (!isProvider(provider)) {
      return buildErrorRedirect(request, "INVALID_PROVIDER");
    }

    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      return buildErrorRedirect(request, oauthError);
    }

    const { state: storedState, codeVerifier } = getOAuthCookies(request);

    if (!storedState || !codeVerifier || !state || storedState !== state) {
      return buildErrorRedirect(request, "INVALID_STATE");
    }

    if (!code) {
      return buildErrorRedirect(request, "MISSING_CODE");
    }

    const tokenResponse = await exchangeCodeForToken(
      provider,
      code,
      codeVerifier,
    );
    const userInfo = await fetchUserInfo(provider, tokenResponse.access_token);

    await getMongoose();
    const user = await findOrCreateUser({
      ...userInfo,
      provider,
    });

    const tokens = await createTokenPair(
      {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        provider: user.provider,
        profileImage: user.profileImage,
      },
      request,
    );

    const homeUrl = new URL("/", request.url);
    const response = NextResponse.redirect(homeUrl);
    setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return buildErrorRedirect(request, "OAUTH_CALLBACK_ERROR");
  }
}
