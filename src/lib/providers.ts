import { AppError } from "@/lib/error";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AppError(
      `${name} 환경변수가 설정되지 않았습니다.`,
      500,
      "ENV_MISSING",
    );
  }
  return value;
}

export function getKakaoProvider() {
  return {
    clientId: getEnv("AUTH_KAKAO_CLIENT_ID"),
    clientSecret: process.env.AUTH_KAKAO_CLIENT_SECRET ?? "",
  };
}

export function getGoogleProvider() {
  return {
    clientId: getEnv("AUTH_GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("AUTH_GOOGLE_CLIENT_SECRET"),
  };
}

export type OAuthProvider = "kakao" | "google";
