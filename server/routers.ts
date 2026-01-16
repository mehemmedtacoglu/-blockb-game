import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { submitScore, getTopScores, getUserBestScore, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, getIncomingFriendRequests, getOutgoingFriendRequests, removeFriend, getFriends, getFriendsLeaderboard } from "./db";
import { checkAndUnlockAchievements, getUserAchievements, getAllAchievementsWithStatus } from "./achievements";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    /**
     * Check if nickname is available (public)
     */
    checkNicknameAvailability: publicProcedure
      .input(
        z.object({
          nickname: z.string().min(3).max(20),
        })
      )
      .query(async ({ input }) => {
        const db = await import("./db").then(m => m.getDb());
        if (!db) {
          throw new Error("Database not available");
        }
        
        const { eq } = await import("drizzle-orm");
        const { users } = await import("../drizzle/schema");
        
        // Check if nickname exists
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.nickname, input.nickname))
          .limit(1);
        
        return { available: existing.length === 0 };
      }),
    
    /**
     * Update user nickname (requires authentication)
     */
    updateNickname: protectedProcedure
      .input(
        z.object({
          nickname: z.string()
            .min(3, "Nickname en az 3 karakter olmal\u0131")
            .max(20, "Nickname en fazla 20 karakter olabilir")
            .regex(/^[a-zA-Z0-9_\u00C0-\u017F]+$/, "Nickname sadece harf, rakam ve alt \u00e7izgi i\u00e7erebilir"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then(m => m.getDb());
        if (!db) {
          throw new Error("Database not available");
        }
        
        const { eq } = await import("drizzle-orm");
        const { users } = await import("../drizzle/schema");
        
        // Check if nickname is already taken by another user
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.nickname, input.nickname))
          .limit(1);
        
        if (existing.length > 0 && existing[0].id !== ctx.user.id) {
          throw new Error("Bu nickname zaten kullan\u0131l\u0131yor");
        }
        
        // Update nickname
        try {
          await db
            .update(users)
            .set({ nickname: input.nickname })
            .where(eq(users.id, ctx.user.id));
          
          return { success: true, nickname: input.nickname };
        } catch (error: any) {
          // Handle unique constraint violation
          if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate')) {
            throw new Error("Bu nickname zaten kullan\u0131l\u0131yor");
          }
          throw error;
        }
      }),
  }),

  leaderboard: router({
    /**
     * Submit a new score (public - supports both authenticated and guest users)
     */
    submitScore: publicProcedure
      .input(
        z.object({
          gameMode: z.enum(["classic", "puzzle"]),
          score: z.number().int().positive(),
          level: z.number().int().positive().optional(),
          guestNickname: z.string().min(3).max(20).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // If user is authenticated, use their ID
        if (ctx.user) {
          const result = await submitScore({
            userId: ctx.user.id,
            gameMode: input.gameMode,
            score: input.score,
            level: input.level,
          });
          return { success: true, result };
        }
        
        // If guest user, require guestNickname
        if (!input.guestNickname) {
          throw new Error("Guest users must provide a nickname");
        }
        
        // For guest users, create a temporary user or use a special guest user ID
        // We'll use userId = 0 to indicate guest users
        const result = await submitScore({
          userId: 0, // Special ID for guest users
          gameMode: input.gameMode,
          score: input.score,
          level: input.level,
          guestNickname: input.guestNickname,
        });
        return { success: true, result };
      }),

    /**
     * Get top scores for a game mode (public)
     */
    getTopScores: publicProcedure
      .input(
        z.object({
          gameMode: z.enum(["classic", "puzzle"]),
          limit: z.number().int().positive().max(100).optional().default(10),
        })
      )
      .query(async ({ input }) => {
        const scores = await getTopScores(input.gameMode, input.limit);
        return scores;
      }),

    /**
     * Get current user's best score (requires authentication)
     */
    getMyBestScore: protectedProcedure
      .input(
        z.object({
          gameMode: z.enum(["classic", "puzzle"]),
        })
      )
      .query(async ({ ctx, input }) => {
        const bestScore = await getUserBestScore(ctx.user.id, input.gameMode);
        return bestScore;
      }),
  }),

  friends: router({  
    /**
     * Search users by name (requires authentication)
     */
    searchUsers: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().int().positive().max(20).optional().default(10),
        })
      )
      .query(async ({ ctx, input }) => {
        const users = await searchUsers(input.query, ctx.user.id, input.limit);
        return users;
      }),

    /**
     * Send a friend request (requires authentication)
     */
    sendFriendRequest: protectedProcedure
      .input(
        z.object({
          friendId: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.friendId) {
          throw new Error("Cannot send friend request to yourself");
        }
        const result = await sendFriendRequest(ctx.user.id, input.friendId);
        return result;
      }),

    /**
     * Accept a friend request (requires authentication)
     */
    acceptFriendRequest: protectedProcedure
      .input(
        z.object({
          requesterId: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await acceptFriendRequest(ctx.user.id, input.requesterId);
        return result;
      }),

    /**
     * Reject a friend request (requires authentication)
     */
    rejectFriendRequest: protectedProcedure
      .input(
        z.object({
          requesterId: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await rejectFriendRequest(ctx.user.id, input.requesterId);
        return result;
      }),

    /**
     * Cancel a sent friend request (requires authentication)
     */
    cancelFriendRequest: protectedProcedure
      .input(
        z.object({
          friendId: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await cancelFriendRequest(ctx.user.id, input.friendId);
        return result;
      }),

    /**
     * Get incoming friend requests (requires authentication)
     */
    getIncomingRequests: protectedProcedure
      .query(async ({ ctx }) => {
        const requests = await getIncomingFriendRequests(ctx.user.id);
        return requests;
      }),

    /**
     * Get outgoing friend requests (requires authentication)
     */
    getOutgoingRequests: protectedProcedure
      .query(async ({ ctx }) => {
        const requests = await getOutgoingFriendRequests(ctx.user.id);
        return requests;
      }),

    /**
     * Remove a friend (requires authentication)
     */
    removeFriend: protectedProcedure
      .input(
        z.object({
          friendId: z.number().int().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await removeFriend(ctx.user.id, input.friendId);
        return result;
      }),

    /**
     * Get friends list (requires authentication)
     */
    getFriends: protectedProcedure
      .query(async ({ ctx }) => {
        const friends = await getFriends(ctx.user.id);
        return friends;
      }),

    /**
     * Get leaderboard for friends only (requires authentication)
     */
    getFriendsLeaderboard: protectedProcedure
      .input(
        z.object({
          gameMode: z.enum(["classic", "puzzle"]),
          limit: z.number().int().positive().max(100).optional().default(10),
        })
      )
      .query(async ({ ctx, input }) => {
        const scores = await getFriendsLeaderboard(ctx.user.id, input.gameMode, input.limit);
        return scores;
      }),
  }),
  
  /**
   * Achievements router
   */
  achievements: router({
    /**
     * Check and unlock achievements after game (requires authentication)
     */
    checkAndUnlock: protectedProcedure
      .input(
        z.object({
          maxCombo: z.number().int().nonnegative().optional(),
          moves: z.number().int().nonnegative().optional(),
          score: z.number().int().nonnegative().optional(),
          bombsUsed: z.number().int().nonnegative().optional(),
          linesCleared: z.number().int().nonnegative().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const unlockedAchievements = await checkAndUnlockAchievements(ctx.user.id, input);
        return { unlockedAchievements };
      }),

    /**
     * Get user's unlocked achievements (requires authentication)
     */
    getUserAchievements: protectedProcedure
      .query(async ({ ctx }) => {
        const achievements = await getUserAchievements(ctx.user.id);
        return achievements;
      }),

    /**
     * Get all achievements with user's unlock status (public)
     */
    getAllWithStatus: publicProcedure
      .input(
        z.object({
          userId: z.number().int().positive().optional(),
        })
      )
      .query(async ({ input }) => {
        const achievements = await getAllAchievementsWithStatus(input.userId || null);
        return achievements;
      }),
  }),
});

export type AppRouter = typeof appRouter;
