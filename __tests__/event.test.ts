import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import { validateInput } from "../src/zod";
import {
  eventBodySchema,
  eventRangeQuerySchema,
} from "../src/zod/event";
import { toEventResponse, normalizeAllDayTimes } from "../src/lib/event";

describe("Event Zod 스키마", () => {
  it("유효한 이벤트 본문을 통과시킨다", () => {
    const data = {
      title: "회의",
      description: "팀 회의",
      location: "Room A",
      startTime: "2024-06-01T09:00:00.000Z",
      endTime: "2024-06-01T10:00:00.000Z",
      allDay: false,
    };
    const parsed = validateInput(eventBodySchema, data);
    expect(parsed.title).toBe("회의");
    expect(parsed.location).toBe("Room A");
    expect(parsed.allDay).toBe(false);
  });

  it("종료 시간이 시작 시간보다 빠르면 실패한다", () => {
    const data = {
      title: "회의",
      startTime: "2024-06-01T10:00:00.000Z",
      endTime: "2024-06-01T09:00:00.000Z",
      allDay: false,
    };
    expect(() => validateInput(eventBodySchema, data)).toThrow();
  });

  it("allDay 기본값은 false", () => {
    const data = {
      title: "회의",
      startTime: "2024-06-01T09:00:00.000Z",
      endTime: "2024-06-01T10:00:00.000Z",
    };
    const parsed = validateInput(eventBodySchema, data);
    expect(parsed.allDay).toBe(false);
  });

  it("기간 조회 쿼리를 파싱한다", () => {
    const query = {
      start: "2024-06-01T00:00:00.000Z",
      end: "2024-06-30T23:59:59.999Z",
    };
    const parsed = validateInput(eventRangeQuerySchema, query);
    expect(parsed.start.toISOString()).toBe(query.start);
    expect(parsed.end.toISOString()).toBe(query.end);
  });
});

describe("Event 보조 함수", () => {
  it("toEventResponse는 날짜를 ISO 문자열로 변환한다", () => {
    const event = {
      _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
      userId: new Types.ObjectId("507f1f77bcf86cd799439012"),
      title: "회의",
      startTime: new Date("2024-06-01T09:00:00.000Z"),
      endTime: new Date("2024-06-01T10:00:00.000Z"),
      allDay: false,
      createdAt: new Date("2024-05-31T00:00:00.000Z"),
      updatedAt: new Date("2024-05-31T00:00:00.000Z"),
    };
    const response = toEventResponse(event);
    expect(response.startTime).toBe("2024-06-01T09:00:00.000Z");
    expect(response.allDay).toBe(false);
  });

  it("allDay=true 시 시작/종료 시간을 UTC 종일로 정규화한다", () => {
    const input = {
      startTime: new Date("2024-06-01T09:00:00.000Z"),
      endTime: new Date("2024-06-01T10:00:00.000Z"),
      allDay: true,
    };
    const { startTime, endTime } = normalizeAllDayTimes(input);
    expect(startTime.toISOString()).toBe("2024-06-01T00:00:00.000Z");
    expect(endTime.toISOString()).toBe("2024-06-01T23:59:59.999Z");
  });

  it("allDay=false 시 시간을 변경하지 않는다", () => {
    const input = {
      startTime: new Date("2024-06-01T09:00:00.000Z"),
      endTime: new Date("2024-06-01T10:00:00.000Z"),
      allDay: false,
    };
    const { startTime, endTime } = normalizeAllDayTimes(input);
    expect(startTime.toISOString()).toBe("2024-06-01T09:00:00.000Z");
    expect(endTime.toISOString()).toBe("2024-06-01T10:00:00.000Z");
  });
});

describe("Event 생성 파이프라인", () => {
  it("종일 일정 입력을 정규화 후 응답으로 직렬화한다", () => {
    const parsed = validateInput(eventBodySchema, {
      title: "휴일",
      location: "집",
      startTime: "2024-06-05T00:00:00.000Z",
      endTime: "2024-06-05T00:00:00.000Z",
      allDay: true,
    });
    const { startTime, endTime } = normalizeAllDayTimes(parsed);

    const event = {
      _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
      userId: new Types.ObjectId("507f1f77bcf86cd799439012"),
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      startTime,
      endTime,
      allDay: parsed.allDay,
      createdAt: new Date("2024-06-01T00:00:00.000Z"),
      updatedAt: new Date("2024-06-01T00:00:00.000Z"),
    };

    const response = toEventResponse(event);
    expect(response.title).toBe("휴일");
    expect(response.location).toBe("집");
    expect(response.allDay).toBe(true);
    expect(response.startTime).toBe("2024-06-05T00:00:00.000Z");
    expect(response.endTime).toBe("2024-06-05T23:59:59.999Z");
  });
});
