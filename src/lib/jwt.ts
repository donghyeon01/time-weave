import { jwtVerify, SignJWT } from "jose";
import { AppError } from "@/lib/error";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  nickname: string;
  provider: string;
  profileImage?: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(
      "JWT_SECRET 환경변수가 설정되지 않았습니다.",
      500,
      "ENV_MISSING",
    );
  }
  return new TextEncoder().encode(secret);
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new AppError(
      `JWT 페이로드의 ${field} 필드가 유효하지 않습니다.`,
      401,
      "INVALID_TOKEN",
    );
  }
  return value;
}

export async function signAccessToken(
  payload: AccessTokenPayload,
): Promise<string> {
  const secret = getSecret();
  const jwtPayload: Record<string, unknown> = { ...payload };
  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret);
}

export async function signRefreshToken(
  userId: string,
  jti: string,
): Promise<string> {
  const secret = getSecret();
  const jwtPayload: Record<string, unknown> = { type: "refresh" };
  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.type === "refresh") {
      throw new AppError("Access Token이 아닙니다.", 401, "INVALID_TOKEN");
    }

    return {
      sub: assertString(payload.sub, "sub"),
      email: assertString(payload.email, "email"),
      name: assertString(payload.name, "name"),
      nickname: assertString(payload.nickname, "nickname"),
      provider: assertString(payload.provider, "provider"),
      profileImage:
        payload.profileImage === undefined
          ? undefined
          : typeof payload.profileImage === "string"
            ? payload.profileImage
            : undefined,
    };
  } catch {
    throw new AppError(
      "유효하지 않은 Access Token입니다.",
      401,
      "INVALID_TOKEN",
    );
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.type !== "refresh") {
      throw new AppError("Refresh Token이 아닙니다.", 401, "INVALID_TOKEN");
    }

    return {
      sub: assertString(payload.sub, "sub"),
      jti: assertString(payload.jti, "jti"),
      type: "refresh",
    };
  } catch {
    throw new AppError(
      "유효하지 않은 Refresh Token입니다.",
      401,
      "INVALID_TOKEN",
    );
  }
}
