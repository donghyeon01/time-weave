import { Types } from "mongoose";
import { AppError } from "@/lib/error";
import { UserModel, type IUser } from "@/models";
import { type OAuthUserInfo } from "@/types/auth";

const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣_]{2,20}$/;

function cleanBaseNickname(name: string): string {
  const cleaned =
    name
      .replace(/[^a-zA-Z0-9가-힣_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 12) || "user";
  return cleaned.slice(0, 13);
}

function generateRandomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

async function generateUniqueNickname(base: string): Promise<string> {
  let candidate = base;
  let attempts = 0;

  while (attempts < 10) {
    if (NICKNAME_REGEX.test(candidate)) {
      const exists = await UserModel.exists({ nickname: candidate });
      if (!exists) {
        return candidate;
      }
    }

    const suffix = `_${generateRandomSuffix()}`;
    candidate = `${base.slice(0, 20 - suffix.length)}${suffix}`;
    attempts++;
  }

  throw new AppError(
    "사용 가능한 닉네임을 생성할 수 없습니다.",
    500,
    "NICKNAME_GENERATION_FAILED",
  );
}

interface FindOrCreateUserInput extends OAuthUserInfo {
  provider: "kakao" | "google";
}

export async function findOrCreateUser(
  input: FindOrCreateUserInput,
): Promise<IUser & { _id: Types.ObjectId }> {
  const existing = await UserModel.findOne({
    provider: input.provider,
    providerAccountId: input.providerAccountId,
  });

  if (existing) {
    return existing as IUser & { _id: Types.ObjectId };
  }

  const nicknameBase = cleanBaseNickname(input.name);
  const nickname = await generateUniqueNickname(nicknameBase);

  const user = await UserModel.create({
    email: input.email,
    name: input.name,
    nickname,
    profileImage: input.profileImage,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
  });

  return user as IUser & { _id: Types.ObjectId };
}
