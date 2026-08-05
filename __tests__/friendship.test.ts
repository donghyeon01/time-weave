import { describe, it, expect } from "vitest";
import {
  sendFriendRequestSchema,
  friendshipIdSchema,
  searchQuerySchema,
} from "../src/zod/friendship";

describe("Friendship Zod schemas", () => {
  it("sendFriendRequestSchema: accepts non-empty identifier", () => {
    const result = sendFriendRequestSchema.safeParse({
      identifier: "test@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.identifier).toBe("test@example.com");
    }
  });

  it("sendFriendRequestSchema: rejects empty identifier", () => {
    const result = sendFriendRequestSchema.safeParse({ identifier: "" });
    expect(result.success).toBe(false);
  });

  it("sendFriendRequestSchema: rejects missing identifier", () => {
    const result = sendFriendRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("friendshipIdSchema: accepts 24-char hex id", () => {
    const validId = "0123456789abcdef01234567";
    const result = friendshipIdSchema.safeParse(validId);
    expect(result.success).toBe(true);
  });

  it("friendshipIdSchema: rejects invalid id", () => {
    const result = friendshipIdSchema.safeParse("not-an-id");
    expect(result.success).toBe(false);
  });

  it("searchQuerySchema: accepts non-empty query", () => {
    const result = searchQuerySchema.safeParse({ q: "hello" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("hello");
    }
  });

  it("searchQuerySchema: rejects empty query", () => {
    const result = searchQuerySchema.safeParse({ q: "" });
    expect(result.success).toBe(false);
  });
});
