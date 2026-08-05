import { z } from "zod";
import { objectIdString } from "./event";

export const schedulingBodySchema = z
  .object({
    title: z
      .string()
      .min(1, "제목은 최소 1자 이상이어야 합니다.")
      .max(200, "제목은 최대 200자까지 입력 가능합니다."),
    description: z
      .string()
      .max(1000, "설명은 최대 1000자까지 입력 가능합니다.")
      .optional(),
    startDate: z.coerce.date({
      message: "시작일은 날짜 형식이어야 합니다.",
    }),
    endDate: z.coerce.date({
      message: "종료일은 날짜 형식이어야 합니다.",
    }),
    slotMinutes: z
      .number()
      .int("슬롯 간격은 정수여야 합니다.")
      .min(15, "슬롯 간격은 최소 15분이어야 합니다.")
      .max(180, "슬롯 간격은 최대 180분이어야 합니다.")
      .optional(),
    participantIds: z.array(objectIdString).default([]),
  })
  .refine((data) => data.endDate.getTime() >= data.startDate.getTime(), {
    message: "종료일은 시작일보다 같거나 늦어야 합니다.",
    path: ["endDate"],
  });

export type SchedulingBodyInput = z.infer<typeof schedulingBodySchema>;
