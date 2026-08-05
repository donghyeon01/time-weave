import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { acceptFriendRequest } from "@/services/friendship";
import { validateInput } from "@/zod";
import { friendshipIdSchema } from "@/zod/friendship";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const { id } = await context.params;
    const friendshipId = validateInput(friendshipIdSchema, id);

    const data = await acceptFriendRequest(friendshipId, payload.sub);
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("친구 요청 수락 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
