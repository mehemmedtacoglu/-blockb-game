import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { Context } from "./_core/trpc";
import { Request, Response } from "express";

// Mock context for testing
const createMockContext = (userId?: number): Context => {
  const mockReq = {} as Request;
  const mockRes = {} as Response;

  return {
    req: mockReq,
    res: mockRes,
    user: userId
      ? {
          id: userId,
          openId: `test-user-${userId}`,
          name: `Test User ${userId}`,
          email: `test${userId}@example.com`,
          role: "user" as const,
          loginMethod: "oauth",
          lastSignedIn: new Date(),
          createdAt: new Date(),
        }
      : undefined,
  };
};

describe("Friends API", () => {
  describe("searchUsers", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.searchUsers({
          query: "test",
        })
      ).rejects.toThrow();
    });

    it("should search users when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const results = await caller.friends.searchUsers({
        query: "test",
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it("should reject queries shorter than 1 character", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      await expect(
        caller.friends.searchUsers({
          query: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("sendFriendRequest", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.sendFriendRequest({
          friendId: 2,
        })
      ).rejects.toThrow();
    });

    it("should not allow sending request to yourself", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      await expect(
        caller.friends.sendFriendRequest({
          friendId: 1,
        })
      ).rejects.toThrow("Cannot send friend request to yourself");
    });

    it("should send a friend request when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.friends.sendFriendRequest({
        friendId: 999, // Use a high ID that likely doesn't exist yet
      });

      expect(result).toHaveProperty("success");
    });
  });

  describe("acceptFriendRequest", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.acceptFriendRequest({
          requesterId: 2,
        })
      ).rejects.toThrow();
    });

    it("should accept a friend request when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.friends.acceptFriendRequest({
        requesterId: 999,
      });

      expect(result).toHaveProperty("success");
    });
  });

  describe("rejectFriendRequest", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.rejectFriendRequest({
          requesterId: 2,
        })
      ).rejects.toThrow();
    });

    it("should reject a friend request when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.friends.rejectFriendRequest({
        requesterId: 999,
      });

      expect(result).toHaveProperty("success");
    });
  });

  describe("cancelFriendRequest", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.cancelFriendRequest({
          friendId: 2,
        })
      ).rejects.toThrow();
    });

    it("should cancel a sent friend request when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.friends.cancelFriendRequest({
        friendId: 999,
      });

      expect(result).toHaveProperty("success");
    });
  });

  describe("getIncomingRequests", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(caller.friends.getIncomingRequests()).rejects.toThrow();
    });

    it("should return incoming requests when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const requests = await caller.friends.getIncomingRequests();

      expect(Array.isArray(requests)).toBe(true);
    });
  });

  describe("getOutgoingRequests", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(caller.friends.getOutgoingRequests()).rejects.toThrow();
    });

    it("should return outgoing requests when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const requests = await caller.friends.getOutgoingRequests();

      expect(Array.isArray(requests)).toBe(true);
    });
  });

  describe("removeFriend", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.removeFriend({
          friendId: 2,
        })
      ).rejects.toThrow();
    });

    it("should remove a friend when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.friends.removeFriend({
        friendId: 2,
      });

      expect(result).toHaveProperty("success");
    });
  });

  describe("getFriends", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(caller.friends.getFriends()).rejects.toThrow();
    });

    it("should return friends list when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const friends = await caller.friends.getFriends();

      expect(Array.isArray(friends)).toBe(true);
    });
  });

  describe("getFriendsLeaderboard", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.friends.getFriendsLeaderboard({
          gameMode: "classic",
        })
      ).rejects.toThrow();
    });

    it("should return friends leaderboard when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const leaderboard = await caller.friends.getFriendsLeaderboard({
        gameMode: "classic",
        limit: 10,
      });

      expect(Array.isArray(leaderboard)).toBe(true);
    });

    it("should accept both classic and puzzle game modes", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const classicLeaderboard = await caller.friends.getFriendsLeaderboard({
        gameMode: "classic",
      });

      const puzzleLeaderboard = await caller.friends.getFriendsLeaderboard({
        gameMode: "puzzle",
      });

      expect(Array.isArray(classicLeaderboard)).toBe(true);
      expect(Array.isArray(puzzleLeaderboard)).toBe(true);
    });
  });
});
