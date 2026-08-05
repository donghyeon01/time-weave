import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import { UserModel } from "@/models";
import { z } from "zod";

const updateMeSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(20, "닉네임은 20자 이하여야 합니다."),
});

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw new AppError("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
    }

    const data = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      profileImage: user.profileImage,
      provider: user.provider,
      providerAccountId: user.providerAccountId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("사용자 정보 조회 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const body = await request.json();
    const parsed = updateMeSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors.map((e) => e.message).join(", "),
        400,
        "VALIDATION_ERROR",
      );
    }

    const { nickname } = parsed.data;
    const existing = await UserModel.findOne({
      nickname,
      _id: { $ne: payload.sub },
    });
    if (existing) {
      throw new AppError(
        "이미 사용 중인 닉네임입니다.",
        409,
        "NICKNAME_DUPLICATE",
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      payload.sub,
      { nickname },
      { new: true },
    );
    if (!user) {
      throw new AppError("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
    }

    const data = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      profileImage: user.profileImage,
      provider: user.provider,
      providerAccountId: user.providerAccountId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("프로필 저장 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
