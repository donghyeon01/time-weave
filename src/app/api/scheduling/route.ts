import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response";
import { validateInput } from "@/zod";
import { schedulingBodySchema } from "@/zod/scheduling";
import { EventModel, SchedulingRequestModel, type IEvent } from "@/models";
import { listFriends } from "@/services/friendship";
import { calculateCommonFreeSlots } from "@/services/scheduling";

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    await getMongoose();

    const body: unknown = await request.json();
    const parsed = validateInput(schedulingBodySchema, body);

    // 선택된 친구들이 모두 현재 사용자의 친구인지 검증
    const friends = await listFriends(payload.sub);
    const friendIdSet = new Set(friends.map((friend) => friend.id));
    for (const id of parsed.participantIds) {
      if (!friendIdSet.has(id)) {
        throw new AppError(
          "선택된 참여자는 친구 관계여야 합니다.",
          403,
          "NOT_FRIEND",
        );
      }
    }

    const participantIds = [payload.sub, ...parsed.participantIds];

    // 기간 내 참여자들의 Event 조회 (겹치는 일정만)
    const events = await EventModel.find({
      userId: { $in: participantIds.map((id) => new Types.ObjectId(id)) },
      startTime: { $lt: parsed.endDate },
      endTime: { $gt: parsed.startDate },
    }).lean<IEvent[]>();

    const slots = calculateCommonFreeSlots(
      parsed.startDate,
      parsed.endDate,
      parsed.slotMinutes,
      participantIds,
      events,
    );

    const schedulingRequest = await SchedulingRequestModel.create({
      hostId: new Types.ObjectId(payload.sub),
      title: parsed.title,
      description: parsed.description,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      slotMinutes: parsed.slotMinutes,
      participantIds: parsed.participantIds.map((id) => new Types.ObjectId(id)),
    });

    return NextResponse.json(
      createSuccessResponse({
        requestId: schedulingRequest._id.toString(),
        slots,
      }),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("일정 조율 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
