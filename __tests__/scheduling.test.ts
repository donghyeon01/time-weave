import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import { validateInput } from "../src/zod";
import { schedulingBodySchema } from "../src/zod/scheduling";
import { calculateCommonFreeSlots } from "../src/services/scheduling";
import type { IEvent } from "../src/models/Event";

function makeUserId(seed: string): Types.ObjectId {
  return new Types.ObjectId(seed.padStart(24, "0"));
}

function makeEvent(
  userIdSeed: string,
  start: string,
  end: string,
  allDay = false,
): IEvent {
  return {
    _id: new Types.ObjectId(),
    userId: makeUserId(userIdSeed),
    title: "일정",
    startTime: new Date(start),
    endTime: new Date(end),
    allDay,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IEvent;
}

describe("Scheduling Zod 스키마", () => {
  it("유효한 조율 요청 본문을 통과시킨다", () => {
    const data = {
      title: "모임",
      description: "팀 모임",
      startDate: "2024-06-01T00:00:00.000Z",
      endDate: "2024-06-03T00:00:00.000Z",
      participantIds: [],
    };
    const parsed = validateInput(schedulingBodySchema, data);
    expect(parsed.title).toBe("모임");
    expect(parsed.slotMinutes).toBeUndefined();
    expect(parsed.participantIds).toEqual([]);
  });

  it("slotMinutes와 친구 ID를 파싱한다", () => {
    const data = {
      title: "모임",
      startDate: "2024-06-01T00:00:00.000Z",
      endDate: "2024-06-01T00:00:00.000Z",
      slotMinutes: 60,
      participantIds: ["0123456789abcdef01234567"],
    };
    const parsed = validateInput(schedulingBodySchema, data);
    expect(parsed.slotMinutes).toBe(60);
    expect(parsed.participantIds).toEqual(["0123456789abcdef01234567"]);
  });

  it("종료일이 시작일보다 빠르면 실패한다", () => {
    const data = {
      title: "모임",
      startDate: "2024-06-02T00:00:00.000Z",
      endDate: "2024-06-01T00:00:00.000Z",
    };
    expect(() => validateInput(schedulingBodySchema, data)).toThrow();
  });

  it("유효하지 않은 participantId를 거부한다", () => {
    const data = {
      title: "모임",
      startDate: "2024-06-01T00:00:00.000Z",
      endDate: "2024-06-01T00:00:00.000Z",
      participantIds: ["bad-id"],
    };
    expect(() => validateInput(schedulingBodySchema, data)).toThrow();
  });
});

describe("Scheduling 공통 가능 시간 계산", () => {
  const start = new Date("2024-06-01T00:00:00.000Z");
  const end = new Date("2024-06-01T00:00:00.000Z");

  it("기본 고정 블록 중 충돌이 없으면 상위 3개를 반환한다", () => {
    const user1 = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const slots = calculateCommonFreeSlots(start, end, undefined, [user1], []);
    expect(slots).toHaveLength(3);
    expect(slots[0].percent).toBe(100);
    expect(slots[0].availableCount).toBe(1);
    expect(slots[0].totalCount).toBe(1);
  });

  it("10-12 블록 충돌 시 해당 블록은 제외되고 상위 3개가 14-22시로 채워진다", () => {
    const user1 = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const events = [
      makeEvent(user1, "2024-06-01T10:30:00.000Z", "2024-06-01T11:30:00.000Z"),
    ];
    const slots = calculateCommonFreeSlots(
      start,
      end,
      undefined,
      [user1],
      events,
    );
    expect(slots).toHaveLength(3);
    expect(
      slots.every((slot) => slot.startTime >= "2024-06-01T14:00:00.000Z"),
    ).toBe(true);
    expect(slots.every((slot) => slot.percent === 100)).toBe(true);
  });

  it("slotMinutes 60으로 09-22시를 분할하고 상위 3개를 반환한다", () => {
    const user1 = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const slots = calculateCommonFreeSlots(start, end, 60, [user1], []);
    expect(slots).toHaveLength(3);
    expect(slots[0].startTime).toBe("2024-06-01T09:00:00.000Z");
    expect(slots[1].startTime).toBe("2024-06-01T10:00:00.000Z");
    expect(slots[2].startTime).toBe("2024-06-01T11:00:00.000Z");
  });

  it("3명 중 2개 블록에 충돌하면 67% 슬롯이 상위 3개에 포함된다", () => {
    const user1 = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const user2 = "bbbbbbbbbbbbbbbbbbbbbbbb";
    const user3 = "cccccccccccccccccccccccc";
    const events = [
      makeEvent(user1, "2024-06-01T10:00:00.000Z", "2024-06-01T12:00:00.000Z"),
      makeEvent(user1, "2024-06-01T14:00:00.000Z", "2024-06-01T16:00:00.000Z"),
    ];
    const slots = calculateCommonFreeSlots(
      start,
      end,
      undefined,
      [user1, user2, user3],
      events,
    );
    const conflictedSlot = slots.find(
      (slot) => slot.startTime === "2024-06-01T10:00:00.000Z",
    );
    expect(conflictedSlot).toBeDefined();
    expect(conflictedSlot!.percent).toBe(67);
    expect(conflictedSlot!.availableCount).toBe(2);
    expect(conflictedSlot!.totalCount).toBe(3);
  });

  it("5인, 7일, slotMinutes 30, 이벤트 100개 기준 1초 이내에 계산된다", () => {
    const participants = Array.from({ length: 5 }, (_, i) =>
      String(i).padStart(24, "a"),
    );
    const events: IEvent[] = [];
    for (let i = 0; i < 100; i++) {
      const day = (i % 7) + 1;
      const hour = (i % 12) + 9;
      const userSeed = participants[i % participants.length];
      events.push(
        makeEvent(
          userSeed,
          `2024-06-0${day}T${String(hour).padStart(2, "0")}:00:00.000Z`,
          `2024-06-0${day}T${String(hour + 1).padStart(2, "0")}:00:00.000Z`,
        ),
      );
    }
    const rangeStart = new Date("2024-06-01T00:00:00.000Z");
    const rangeEnd = new Date("2024-06-07T00:00:00.000Z");
    const t0 = Date.now();
    const slots = calculateCommonFreeSlots(
      rangeStart,
      rangeEnd,
      30,
      participants,
      events,
    );
    const elapsed = Date.now() - t0;
    expect(slots).toHaveLength(3);
    expect(elapsed).toBeLessThan(1000);
  });
});
