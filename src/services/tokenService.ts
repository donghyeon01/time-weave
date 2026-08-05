import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { sha256Hex } from "@/lib/crypto";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { AppError } from "@/lib/error";
import { RefreshTokenModel, UserModel, type IUser } from "@/models";

const MAX_CONCURRENT_SESSIONS = 5;

interface TokenUser {
  _id: string;
  email: string;
  name: string;
  nickname: string;
  provider: string;
  profileImage?: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

function getClientInfo(request: NextRequest): {
  userAgent: string;
  ipAddress: string;
} {
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
  return { userAgent, ipAddress };
}

async function enforceSessionLimit(userId: string): Promise<void> {
  const now = new Date();
  await RefreshTokenModel.deleteMany({
    userId,
    expiresAt: { $lt: now },
  });

  const count = await RefreshTokenModel.countDocuments({ userId });
  if (count >= MAX_CONCURRENT_SESSIONS) {
    const excess = count - MAX_CONCURRENT_SESSIONS + 1;
    const oldest = await RefreshTokenModel.find({ userId })
      .sort({ lastAccessedAt: 1 })
      .limit(excess)
      .select("_id");

    const ids = oldest.map((doc) => doc._id);
    await RefreshTokenModel.deleteMany({ _id: { $in: ids } });
  }
}

export async function createTokenPair(
  user: TokenUser,
  request: NextRequest,
): Promise<AuthTokenPair> {
  const userId = user._id;

  await enforceSessionLimit(userId);

  const jti = randomUUID();
  const accessToken = await signAccessToken({
    sub: userId,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    provider: user.provider,
    profileImage: user.profileImage,
  });
  const refreshToken = await signRefreshToken(userId, jti);
  const tokenHash = sha256Hex(refreshToken);

  const { userAgent, ipAddress } = getClientInfo(request);

  await RefreshTokenModel.create({
    userId,
    tokenId: jti,
    tokenHash,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastAccessedAt: new Date(),
  });

  return { accessToken, refreshToken };
}

export async function rotateTokenPair(
  oldTokenHash: string,
  request: NextRequest,
): Promise<AuthTokenPair> {
  const oldRecord = await RefreshTokenModel.findOne({
    tokenHash: oldTokenHash,
  });
  if (!oldRecord) {
    throw new AppError(
      "유효하지 않은 Refresh Token입니다.",
      401,
      "INVALID_TOKEN",
    );
  }

  if (oldRecord.expiresAt < new Date()) {
    await RefreshTokenModel.deleteOne({ _id: oldRecord._id });
    throw new AppError("만료된 Refresh Token입니다.", 401, "TOKEN_EXPIRED");
  }

  const user = (await UserModel.findById(oldRecord.userId)) as
    | (IUser & { _id: import("mongoose").Types.ObjectId })
    | null;
  if (!user) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
  }

  await RefreshTokenModel.deleteOne({ _id: oldRecord._id });
  await enforceSessionLimit(user._id.toString());

  const jti = randomUUID();
  const accessToken = await signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    provider: user.provider,
    profileImage: user.profileImage,
  });
  const refreshToken = await signRefreshToken(user._id.toString(), jti);
  const tokenHash = sha256Hex(refreshToken);

  const { userAgent, ipAddress } = getClientInfo(request);

  await RefreshTokenModel.create({
    userId: user._id,
    tokenId: jti,
    tokenHash,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastAccessedAt: new Date(),
  });

  return { accessToken, refreshToken };
}

export async function removeRefreshTokenByHash(
  tokenHash: string,
): Promise<void> {
  await RefreshTokenModel.deleteOne({ tokenHash });
}
