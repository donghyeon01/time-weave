import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import { createErrorResponse } from "@/lib/response";
import { deleteOrCancelFriendship } from "@/services/friendship";
import { validateInput } from "@/zod";
import { friendshipIdSchema } from "@/zod/friendship";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const { id } = await context.params;
    const friendshipId = validateInput(friendshipIdSchema, id);

    await deleteOrCancelFriendship(friendshipId, payload.sub);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("친구 관계 삭제 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
