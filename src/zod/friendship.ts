import { z } from "zod";

const OBJECT_ID_HEX = /^[0-9a-fA-F]{24}$/;

export const friendshipIdSchema = z
  .string()
  .regex(OBJECT_ID_HEX, "유효하지 않은 식별자입니다.");

export const sendFriendRequestSchema = z.object({
  identifier: z
    .string()
    .min(1, "닉네임 또는 이메일을 입력해주세요.")
    .max(254, "입력값이 너무 깁니다."),
});

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "검색어를 입력해주세요.")
    .max(100, "검색어가 너무 깁니다."),
});
