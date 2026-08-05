import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdString = z
  .string()
  .regex(objectIdRegex, "올바른 MongoDB ObjectId 형식이 아닙니다.");

export const eventBodySchema = z
  .object({
    title: z
      .string()
      .min(1, "제목은 최소 1자 이상이어야 합니다.")
      .max(200, "제목은 최대 200자까지 입력 가능합니다."),
    description: z
      .string()
      .max(1000, "설명은 최대 1000자까지 입력 가능합니다.")
      .optional(),
    location: z
      .string()
      .max(200, "장소는 최대 200자까지 입력 가능합니다.")
      .optional(),
    startTime: z.coerce.date({
      message: "시작 시간은 날짜 형식이어야 합니다.",
    }),
    endTime: z.coerce.date({
      message: "종료 시간은 날짜 형식이어야 합니다.",
    }),
    allDay: z.boolean().default(false),
  })
  .refine((data) => data.endTime.getTime() >= data.startTime.getTime(), {
    message: "종료 시간은 시작 시간보다 같거나 늦어야 합니다.",
    path: ["endTime"],
  });

export const eventRangeQuerySchema = z.object({
  start: z.coerce.date({
    message: "start는 날짜 형식이어야 합니다.",
  }),
  end: z.coerce.date({
    message: "end는 날짜 형식이어야 합니다.",
  }),
});

export type EventBodyInput = z.infer<typeof eventBodySchema>;
