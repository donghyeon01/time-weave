import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { searchUsers } from "@/services/friendship";
import { validateInput } from "@/zod";
import { searchQuerySchema } from "@/zod/friendship";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const q = request.nextUrl.searchParams.get("q") ?? "";
    const { q: query } = validateInput(searchQuerySchema, { q });

    const data = await searchUsers(payload.sub, query);
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("친구 검색 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
