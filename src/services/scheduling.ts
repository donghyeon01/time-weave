import { AppError } from "@/lib/error";
import type { IEvent } from "@/models/Event";

export interface SchedulingSlot {
  startTime: string;
  endTime: string;
  percent: number;
  availableCount: number;
  totalCount: number;
}

const DEFAULT_BLOCKS = [
  { start: 10, end: 12 },
  { start: 14, end: 16 },
  { start: 18, end: 20 },
  { start: 20, end: 22 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function addDaysUTC(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(date.getUTCDate() + days);
  return next;
}

function buildDailySlots(
  day: Date,
  slotMinutes: number | undefined,
): { start: Date; end: Date }[] {
  if (!slotMinutes) {
    return DEFAULT_BLOCKS.map(({ start, end }) => ({
      start: new Date(
        Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          start,
        ),
      ),
      end: new Date(
        Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          end,
        ),
      ),
    }));
  }

  const slots: { start: Date; end: Date }[] = [];
  const startMinutes = 9 * 60;
  const endMinutes = 22 * 60;

  for (let t = startMinutes; t + slotMinutes <= endMinutes; t += slotMinutes) {
    const start = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        0,
        t,
      ),
    );
    const end = new Date(
      Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate(),
        0,
        t + slotMinutes,
      ),
    );
    slots.push({ start, end });
  }

  return slots;
}

function buildUserEventsMap(events: IEvent[]): Map<string, IEvent[]> {
  const map = new Map<string, IEvent[]>();
  for (const event of events) {
    const userId = event.userId.toString();
    const list = map.get(userId) ?? [];
    list.push(event);
    map.set(userId, list);
  }
  return map;
}

function hasConflict(
  userEvents: IEvent[] | undefined,
  start: Date,
  end: Date,
): boolean {
  if (!userEvents || userEvents.length === 0) {
    return false;
  }

  for (const event of userEvents) {
    if (event.startTime < end && event.endTime > start) {
      return true;
    }
  }
  return false;
}

// 기간 내 모든 참여자의 일정을 기반으로 공통 가능 시간 상위 3개를 계산
export function calculateCommonFreeSlots(
  startDate: Date,
  endDate: Date,
  slotMinutes: number | undefined,
  participantIds: string[],
  events: IEvent[],
): SchedulingSlot[] {
  if (participantIds.length === 0) {
    throw new AppError("참여자가 한 명 이상 필요합니다.", 400, "NO_PARTICIPANTS");
  }

  const userEventsMap = buildUserEventsMap(events);
  const startDay = startOfDayUTC(startDate);
  const endDay = startOfDayUTC(endDate);
  const dayCount = Math.max(
    0,
    Math.floor((endDay.getTime() - startDay.getTime()) / DAY_MS),
  );

  const allSlots: SchedulingSlot[] = [];
  const totalCount = participantIds.length;

  for (let d = 0; d <= dayCount; d++) {
    const day = addDaysUTC(startDay, d);
    const slots = buildDailySlots(day, slotMinutes);

    for (const { start, end } of slots) {
      let availableCount = 0;
      for (const participantId of participantIds) {
        const userEvents = userEventsMap.get(participantId);
        if (!hasConflict(userEvents, start, end)) {
          availableCount += 1;
        }
      }

      const percent = Math.round((availableCount / totalCount) * 100);
      allSlots.push({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        percent,
        availableCount,
        totalCount,
      });
    }
  }

  // 참여 가능 비율 내림차순, 동률이면 이른 시간 우선
  allSlots.sort((a, b) => {
    if (b.percent !== a.percent) {
      return b.percent - a.percent;
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return allSlots.slice(0, 3);
}
