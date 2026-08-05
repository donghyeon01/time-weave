import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { verifyAccessToken, type AccessTokenPayload } from "@/lib/jwt";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_CODE_VERIFIER_COOKIE = "oauth_code_verifier";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getAccessToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function getCurrentUser(
  request: NextRequest,
): Promise<AccessTokenPayload> {
  const token = getAccessToken(request);
  if (!token) {
    throw new AppError("인증이 필요합니다.", 401, "UNAUTHORIZED");
  }
  return verifyAccessToken(token);
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): NextResponse {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    cookieOptions(30 * 60),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    cookieOptions(7 * 24 * 60 * 60),
  );
  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...cookieOptions(0) });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...cookieOptions(0) });
  return response;
}

export function setOAuthCookies(
  response: NextResponse,
  state: string,
  codeVerifier: string,
): NextResponse {
  const options = cookieOptions(10 * 60);
  response.cookies.set(OAUTH_STATE_COOKIE, state, options);
  response.cookies.set(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, options);
  return response;
}

export function getOAuthCookies(request: NextRequest): {
  state?: string;
  codeVerifier?: string;
} {
  return {
    state: request.cookies.get(OAUTH_STATE_COOKIE)?.value,
    codeVerifier: request.cookies.get(OAUTH_CODE_VERIFIER_COOKIE)?.value,
  };
}

export function clearOAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(OAUTH_STATE_COOKIE, "", { ...cookieOptions(0) });
  response.cookies.set(OAUTH_CODE_VERIFIER_COOKIE, "", { ...cookieOptions(0) });
  return response;
}
