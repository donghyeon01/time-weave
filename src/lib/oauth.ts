import { createHash, randomBytes } from "crypto";
import { AppError } from "@/lib/error";
import {
  getKakaoProvider,
  getGoogleProvider,
  type OAuthProvider,
} from "@/lib/providers";
import { type OAuthUserInfo } from "@/types/auth";

const ENDPOINTS = {
  kakao: {
    authorization: "https://kauth.kakao.com/oauth/authorize",
    token: "https://kauth.kakao.com/oauth/token",
    userinfo: "https://kapi.kakao.com/v2/user/me",
    scope: "account_email profile_nickname profile_image name",
  },
  google: {
    authorization: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
  },
};

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function getClientCredentials(provider: OAuthProvider): {
  clientId: string;
  clientSecret: string;
} {
  const config =
    provider === "kakao" ? getKakaoProvider() : getGoogleProvider();
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;

  if (!clientId) {
    throw new AppError(
      `${provider} clientId가 설정되지 않았습니다.`,
      500,
      "ENV_MISSING",
    );
  }

  return {
    clientId,
    clientSecret: clientSecret ?? "",
  };
}

export function getRedirectUri(provider: OAuthProvider): string {
  if (provider === "kakao" && process.env.AUTH_KAKAO_REDIRECT_URI) {
    return process.env.AUTH_KAKAO_REDIRECT_URI;
  }
  return `${getBaseUrl()}/api/auth/callback/${provider}`;
}

export function generateCodeVerifier(): string {
  return randomBytes(96).toString("base64url");
}

export function createCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function buildAuthorizationUrl(
  provider: OAuthProvider,
  state: string,
  codeChallenge: string,
): string {
  const { clientId } = getClientCredentials(provider);
  const redirectUri = getRedirectUri(provider);
  const endpoints = ENDPOINTS[provider];

  const url = new URL(endpoints.authorization);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("scope", endpoints.scope);

  if (provider === "google") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
  }

  return url.toString();
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const { clientId, clientSecret } = getClientCredentials(provider);
  const redirectUri = getRedirectUri(provider);
  const tokenEndpoint = ENDPOINTS[provider].token;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  if (clientSecret) {
    params.set("client_secret", clientSecret);
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: params.toString(),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new AppError(
      "OAuth 토큰 교환에 실패했습니다.",
      400,
      "OAUTH_TOKEN_ERROR",
      data,
    );
  }

  if (!isTokenResponse(data)) {
    throw new AppError(
      "OAuth 토큰 응답 형식이 올바르지 않습니다.",
      502,
      "OAUTH_TOKEN_ERROR",
    );
  }

  return data;
}

function isTokenResponse(data: unknown): data is TokenResponse {
  if (typeof data !== "object" || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.access_token === "string" &&
    typeof record.token_type === "string"
  );
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string,
): Promise<OAuthUserInfo> {
  const userinfoEndpoint = ENDPOINTS[provider].userinfo;

  const response = await fetch(userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    throw new AppError(
      "OAuth 사용자 정보 조회에 실패했습니다.",
      502,
      "OAUTH_USERINFO_ERROR",
      data,
    );
  }

  return parseUserInfo(provider, data);
}

function parseUserInfo(provider: OAuthProvider, data: unknown): OAuthUserInfo {
  if (typeof data !== "object" || data === null) {
    throw new AppError(
      "OAuth 사용자 정보 형식이 올바르지 않습니다.",
      502,
      "OAUTH_USERINFO_ERROR",
    );
  }

  const record = data as Record<string, unknown>;

  if (provider === "kakao") {
    return parseKakaoUserInfo(record);
  }

  return parseGoogleUserInfo(record);
}

function parseKakaoUserInfo(record: Record<string, unknown>): OAuthUserInfo {
  const providerAccountId =
    typeof record.id === "number" || typeof record.id === "string"
      ? String(record.id)
      : undefined;

  const account =
    typeof record.kakao_account === "object" && record.kakao_account !== null
      ? (record.kakao_account as Record<string, unknown>)
      : {};

  const profile =
    typeof account.profile === "object" && account.profile !== null
      ? (account.profile as Record<string, unknown>)
      : {};

  const properties =
    typeof record.properties === "object" && record.properties !== null
      ? (record.properties as Record<string, unknown>)
      : {};

  const email = typeof account.email === "string" ? account.email : undefined;
  const name =
    typeof account.name === "string"
      ? account.name
      : typeof profile.nickname === "string"
        ? profile.nickname
        : typeof properties.nickname === "string"
          ? properties.nickname
          : undefined;

  const profileImage =
    typeof profile.profile_image_url === "string"
      ? profile.profile_image_url
      : typeof properties.profile_image === "string"
        ? properties.profile_image
        : undefined;

  if (!providerAccountId || !email || !name) {
    throw new AppError(
      "카카오 계정의 필수 정보가 누락되었습니다.",
      400,
      "OAUTH_INSUFFICIENT_INFO",
    );
  }

  return {
    providerAccountId,
    email,
    name,
    profileImage,
  };
}

function parseGoogleUserInfo(record: Record<string, unknown>): OAuthUserInfo {
  const providerAccountId =
    typeof record.sub === "string" ? record.sub : undefined;
  const email = typeof record.email === "string" ? record.email : undefined;
  const name = typeof record.name === "string" ? record.name : undefined;
  const profileImage =
    typeof record.picture === "string" ? record.picture : undefined;

  if (!providerAccountId || !email || !name) {
    throw new AppError(
      "구글 계정의 필수 정보가 누락되었습니다.",
      400,
      "OAUTH_INSUFFICIENT_INFO",
    );
  }

  return {
    providerAccountId,
    email,
    name,
    profileImage,
  };
}
