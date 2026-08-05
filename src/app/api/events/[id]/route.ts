import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { toEventResponse, normalizeAllDayTimes } from "@/lib/event";
import { validateInput } from "@/zod";
import { eventBodySchema, objectIdString } from "@/zod/event";
import { EventModel } from "@/models";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const { id } = await context.params;
    const validId = validateInput(objectIdString, id);

    const event = await EventModel.findById(validId).lean();
    if (!event) {
      throw new AppError("일정을 찾을 수 없습니다.", 404, "EVENT_NOT_FOUND");
    }

    const eventUserId = event.userId.toString();
    if (eventUserId !== payload.sub) {
      throw new AppError(
        "해당 일정을 수정할 권한이 없습니다.",
        403,
        "FORBIDDEN",
      );
    }

    const body = (await request.json()) as unknown;
    const parsed = validateInput(eventBodySchema, body);
    const { startTime, endTime } = normalizeAllDayTimes(parsed);

    const updated = await EventModel.findByIdAndUpdate(
      validId,
      {
        ...parsed,
        startTime,
        endTime,
      },
      { new: true },
    ).lean();

    if (!updated) {
      throw new AppError("일정 수정에 실패했습니다.", 500, "UPDATE_FAILED");
    }

    return NextResponse.json(createSuccessResponse(toEventResponse(updated)));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("일정 수정 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const { id } = await context.params;
    const validId = validateInput(objectIdString, id);

    const event = await EventModel.findById(validId).lean();
    if (!event) {
      throw new AppError("일정을 찾을 수 없습니다.", 404, "EVENT_NOT_FOUND");
    }

    const eventUserId = event.userId.toString();
    if (eventUserId !== payload.sub) {
      throw new AppError(
        "해당 일정을 삭제할 권한이 없습니다.",
        403,
        "FORBIDDEN",
      );
    }

    await EventModel.findByIdAndDelete(new Types.ObjectId(validId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("일정 삭제 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
