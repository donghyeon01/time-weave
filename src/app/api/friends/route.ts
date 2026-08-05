import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { listFriends, sendFriendRequest } from "@/services/friendship";
import { validateInput } from "@/zod";
import { sendFriendRequestSchema } from "@/zod/friendship";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const data = await listFriends(payload.sub);
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("친구 목록 조회 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const body: unknown = await request.json();
    const { identifier } = validateInput(sendFriendRequestSchema, body);

    const data = await sendFriendRequest(payload.sub, identifier);
    return NextResponse.json(createSuccessResponse(data), { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("친구 요청 처리 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
