import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { toEventResponse, normalizeAllDayTimes } from "@/lib/event";
import { validateInput } from "@/zod";
import { eventBodySchema } from "@/zod/event";
import { EventModel } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const events = await EventModel.find({ userId: payload.sub })
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
      createErrorResponse("일정 조회 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const body = (await request.json()) as unknown;
    const parsed = validateInput(eventBodySchema, body);
    const { startTime, endTime } = normalizeAllDayTimes(parsed);

    const event = await EventModel.create({
      ...parsed,
      userId: payload.sub,
      startTime,
      endTime,
    });

    return NextResponse.json(
      createSuccessResponse(toEventResponse(event)),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("일정 생성 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
