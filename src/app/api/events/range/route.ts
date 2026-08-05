import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { toEventResponse } from "@/lib/event";
import { validateInput } from "@/zod";
import { eventRangeQuerySchema } from "@/zod/event";
import { EventModel } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const { searchParams } = request.nextUrl;
    const query = {
      start: searchParams.get("start") ?? undefined,
      end: searchParams.get("end") ?? undefined,
    };
    const { start, end } = validateInput(eventRangeQuerySchema, query);

    if (end.getTime() < start.getTime()) {
      throw new AppError(
        "종료 시간은 시작 시간보다 늦어야 합니다.",
        400,
        "INVALID_RANGE",
      );
    }

    // 주어진 기간과 겹치는 일정 조회 (startTime <= end && endTime >= start)
    const events = await EventModel.find({
      userId: payload.sub,
      startTime: { $lte: end },
      endTime: { $gte: start },
    })
      .sort({ startTime: 1 })
      .lean();

    return NextResponse.json(
      createSuccessResponse(events.map(toEventResponse)),
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("기간 일정 조회 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
