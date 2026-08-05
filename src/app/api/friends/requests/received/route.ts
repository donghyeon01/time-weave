import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { listReceivedRequests } from "@/services/friendship";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const data = await listReceivedRequests(payload.sub);
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("받은 친구 요청 조회 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
