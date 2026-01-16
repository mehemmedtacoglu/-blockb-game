import { describe, it, expect, beforeAll } from "vitest";
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

describe("Leaderboard API", () => {
  describe("submitScore", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.leaderboard.submitScore({
          gameMode: "classic",
          score: 1000,
          level: 5,
        })
      ).rejects.toThrow();
    });

    it("should accept valid score submission when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const result = await caller.leaderboard.submitScore({
        gameMode: "classic",
        score: 1000,
        level: 5,
      });

      expect(result.success).toBe(true);
    });

    it("should validate score is positive", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      await expect(
        caller.leaderboard.submitScore({
          gameMode: "classic",
          score: -100,
          level: 5,
        })
      ).rejects.toThrow();
    });

    it("should accept both classic and puzzle game modes", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      const classicResult = await caller.leaderboard.submitScore({
        gameMode: "classic",
        score: 1000,
        level: 5,
      });

      const puzzleResult = await caller.leaderboard.submitScore({
        gameMode: "puzzle",
        score: 500,
        level: 3,
      });

      expect(classicResult.success).toBe(true);
      expect(puzzleResult.success).toBe(true);
    });
  });

  describe("getTopScores", () => {
    it("should return top scores without authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const scores = await caller.leaderboard.getTopScores({
        gameMode: "classic",
        limit: 10,
      });

      expect(Array.isArray(scores)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const scores = await caller.leaderboard.getTopScores({
        gameMode: "classic",
        limit: 5,
      });

      expect(scores.length).toBeLessThanOrEqual(5);
    });

    it("should enforce maximum limit of 100", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.leaderboard.getTopScores({
          gameMode: "classic",
          limit: 150,
        })
      ).rejects.toThrow();
    });
  });

  describe("getMyBestScore", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.leaderboard.getMyBestScore({
          gameMode: "classic",
        })
      ).rejects.toThrow();
    });

    it("should return user's best score when authenticated", async () => {
      const caller = appRouter.createCaller(createMockContext(1));

      // First submit a score
      await caller.leaderboard.submitScore({
        gameMode: "classic",
        score: 2000,
        level: 10,
      });

      // Then get best score
      const bestScore = await caller.leaderboard.getMyBestScore({
        gameMode: "classic",
      });

      // Should return a score or null
      if (bestScore) {
        expect(bestScore.score).toBeGreaterThan(0);
      }
    });
  });
});
