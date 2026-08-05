import type { Types } from "mongoose";

export interface EventResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventDocumentLike {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose 문서를 클라이언트 응답 객체로 변환
export function toEventResponse(event: EventDocumentLike): EventResponse {
  return {
    id: event._id.toString(),
    userId: event.userId.toString(),
    title: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    allDay: event.allDay,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

// 종일 일정은 UTC 기준 해당 일의 00:00:00 ~ 23:59:59.999 으로 정규화
export function normalizeAllDayTimes(input: {
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}): { startTime: Date; endTime: Date } {
  if (!input.allDay) {
    return { startTime: input.startTime, endTime: input.endTime };
  }

  const start = new Date(
    Date.UTC(
      input.startTime.getUTCFullYear(),
      input.startTime.getUTCMonth(),
      input.startTime.getUTCDate(),
    ),
  );

  const end = new Date(
    Date.UTC(
      input.endTime.getUTCFullYear(),
      input.endTime.getUTCMonth(),
      input.endTime.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  return { startTime: start, endTime: end };
}
