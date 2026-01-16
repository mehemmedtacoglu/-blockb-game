import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

// Helper to create mock context
function createMockContext(userId?: number): TrpcContext {
  const mockReq = {} as any;
  const mockRes = {
    clearCookie: () => {},
  } as any;

  if (userId) {
    return {
      user: {
        id: userId,
        openId: `test-open-id-${userId}`,
        name: `Test User ${userId}`,
        email: `test${userId}@example.com`,
        nickname: null,
        loginMethod: "test",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: mockReq,
      res: mockRes,
    };
  }

  return {
    user: null,
    req: mockReq,
    res: mockRes,
  };
}

describe("Nickname System", () => {
  describe("updateNickname", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.auth.updateNickname({
          nickname: "TestNick",
        })
      ).rejects.toThrow();
    });

    it("should reject nickname shorter than 3 characters", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      await expect(
        caller.auth.updateNickname({
          nickname: "ab",
        })
      ).rejects.toThrow();
    });

    it("should reject nickname longer than 20 characters", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      await expect(
        caller.auth.updateNickname({
          nickname: "ThisNicknameIsWayTooLongForTheSystem",
        })
      ).rejects.toThrow();
    });

    it("should reject nickname with special characters", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      await expect(
        caller.auth.updateNickname({
          nickname: "Test@Nick!",
        })
      ).rejects.toThrow();
    });

    it("should accept valid nickname with letters and numbers", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.auth.updateNickname({
        nickname: "CyberGamer123",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("nickname", "CyberGamer123");
    });

    it("should accept nickname with underscore", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.auth.updateNickname({
        nickname: "Cyber_Gamer",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("nickname", "Cyber_Gamer");
    });

    it("should accept nickname with Turkish characters", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.auth.updateNickname({
        nickname: "ÖzgürOyuncu",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("nickname", "ÖzgürOyuncu");
    });

    it("should reject duplicate nickname", async () => {
      // First user sets nickname
      const caller1 = appRouter.createCaller(createMockContext(1));
      await caller1.auth.updateNickname({
        nickname: "UniqueGamer",
      });

      // Second user tries to use same nickname
      const caller2 = appRouter.createCaller(createMockContext(2));
      await expect(
        caller2.auth.updateNickname({
          nickname: "UniqueGamer",
        })
      ).rejects.toThrow("Bu nickname zaten kullan\u0131l\u0131yor");
    });

    it("should allow user to update their own nickname", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      // Set initial nickname
      await caller.auth.updateNickname({
        nickname: "FirstNick",
      });

      // Update to new nickname
      const result = await caller.auth.updateNickname({
        nickname: "SecondNick",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("nickname", "SecondNick");
    });
  });

  describe("checkNicknameAvailability", () => {
    it("should return available for unused nickname", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.auth.checkNicknameAvailability({
        nickname: "AvailableNick",
      });

      expect(result).toHaveProperty("available", true);
    });

    it("should return unavailable for taken nickname", async () => {
      // First set a nickname
      const caller1 = appRouter.createCaller(createMockContext(1));
      await caller1.auth.updateNickname({
        nickname: "TakenNick",
      });

      // Check availability
      const caller2 = appRouter.createCaller(createMockContext());
      const result = await caller2.auth.checkNicknameAvailability({
        nickname: "TakenNick",
      });

      expect(result).toHaveProperty("available", false);
    });

    it("should not require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.auth.checkNicknameAvailability({
        nickname: "TestNick",
      });

      expect(result).toHaveProperty("available");
    });
  });
});
