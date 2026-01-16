import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, scores, InsertScore, friendships, InsertFriendship } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Submit a new score to the leaderboard
 */
export async function submitScore(score: InsertScore) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot submit score: database not available");
    return null;
  }

  try {
    const result = await db.insert(scores).values(score);
    return result;
  } catch (error) {
    console.error("[Database] Failed to submit score:", error);
    throw error;
  }
}

/**
 * Get top scores for a specific game mode
 */
export async function getTopScores(gameMode: "classic" | "puzzle", limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get top scores: database not available");
    return [];
  }

  try {
    const { desc, eq: eqOp } = await import("drizzle-orm");
    const result = await db
      .select({
        id: scores.id,
        userId: scores.userId,
        userName: users.nickname,
        userEmail: users.email,
        guestNickname: scores.guestNickname,
        score: scores.score,
        level: scores.level,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .leftJoin(users, eqOp(scores.userId, users.id))
      .where(eqOp(scores.gameMode, gameMode))
      .orderBy(desc(scores.score))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get top scores:", error);
    return [];
  }
}

/**
 * Get user's best score for a specific game mode
 */
export async function getUserBestScore(userId: number, gameMode: "classic" | "puzzle") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user best score: database not available");
    return null;
  }

  try {
    const { desc, eq: eqOp, and } = await import("drizzle-orm");
    const result = await db
      .select()
      .from(scores)
      .where(and(eqOp(scores.userId, userId), eqOp(scores.gameMode, gameMode)))
      .orderBy(desc(scores.score))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user best score:", error);
    return null;
  }
}

/**
 * Search users by name
 */
export async function searchUsers(query: string, currentUserId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search users: database not available");
    return [];
  }

  try {
    const { like, ne, or } = await import("drizzle-orm");
    const result = await db
      .select({
        id: users.id,
        name: users.nickname,
        email: users.email,
      })
      .from(users)
      .where(
        or(
          like(users.nickname, `%${query}%`),
          like(users.email, `%${query}%`)
        )
      )
      .limit(limit);

    // Filter out current user
    return result.filter(u => u.id !== currentUserId);
  } catch (error) {
    console.error("[Database] Failed to search users:", error);
    return [];
  }
}

/**
 * Send a friend request (pending status)
 */
export async function sendFriendRequest(userId: number, friendId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot send friend request: database not available");
    return null;
  }

  try {
    // Check if any friendship already exists
    const { eq, and, or } = await import("drizzle-orm");
    const existing = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === "pending") {
        return { success: false, message: "Friend request already sent" };
      } else if (status === "accepted") {
        return { success: false, message: "Already friends" };
      }
    }

    // Create pending friend request (one-way)
    await db.insert(friendships).values({
      userId,
      friendId,
      status: "pending",
    });

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to send friend request:", error);
    throw error;
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(userId: number, requesterId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot accept friend request: database not available");
    return null;
  }

  try {
    const { eq, and } = await import("drizzle-orm");
    
    // Find the pending request
    const request = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.userId, requesterId),
          eq(friendships.friendId, userId),
          eq(friendships.status, "pending")
        )
      )
      .limit(1);

    if (request.length === 0) {
      return { success: false, message: "Friend request not found" };
    }

    // Update the request to accepted
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, request[0].id));

    // Create the reverse friendship (bidirectional)
    await db.insert(friendships).values({
      userId,
      friendId: requesterId,
      status: "accepted",
    });

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to accept friend request:", error);
    throw error;
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(userId: number, requesterId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reject friend request: database not available");
    return null;
  }

  try {
    const { eq, and } = await import("drizzle-orm");
    
    // Delete the pending request
    await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.userId, requesterId),
          eq(friendships.friendId, userId),
          eq(friendships.status, "pending")
        )
      );

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to reject friend request:", error);
    throw error;
  }
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(userId: number, friendId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot cancel friend request: database not available");
    return null;
  }

  try {
    const { eq, and } = await import("drizzle-orm");
    
    await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.friendId, friendId),
          eq(friendships.status, "pending")
        )
      );

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to cancel friend request:", error);
    throw error;
  }
}

/**
 * Get incoming friend requests (pending requests where user is the recipient)
 */
export async function getIncomingFriendRequests(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get incoming requests: database not available");
    return [];
  }

  try {
    const { eq, and } = await import("drizzle-orm");
    const result = await db
      .select({
        id: friendships.id,
        requesterId: users.id,
        requesterName: users.nickname,
        requesterEmail: users.email,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.userId, users.id))
      .where(
        and(
          eq(friendships.friendId, userId),
          eq(friendships.status, "pending")
        )
      );

    return result;
  } catch (error) {
    console.error("[Database] Failed to get incoming requests:", error);
    return [];
  }
}

/**
 * Get outgoing friend requests (pending requests sent by user)
 */
export async function getOutgoingFriendRequests(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get outgoing requests: database not available");
    return [];
  }

  try {
    const { eq, and } = await import("drizzle-orm");
    const result = await db
      .select({
        id: friendships.id,
        recipientId: users.id,
        recipientName: users.nickname,
        recipientEmail: users.email,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.status, "pending")
        )
      );

    return result;
  } catch (error) {
    console.error("[Database] Failed to get outgoing requests:", error);
    return [];
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(userId: number, friendId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot remove friend: database not available");
    return null;
  }

  try {
    const { eq, and, or } = await import("drizzle-orm");
    await db
      .delete(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      );

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to remove friend:", error);
    throw error;
  }
}

/**
 * Get user's friends list (only accepted friendships)
 */
export async function getFriends(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get friends: database not available");
    return [];
  }

  try {
    const { eq, and } = await import("drizzle-orm");
    const result = await db
      .select({
        id: users.id,
        name: users.nickname,
        email: users.email,
        friendshipId: friendships.id,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.status, "accepted")
        )
      );

    return result;
  } catch (error) {
    console.error("[Database] Failed to get friends:", error);
    return [];
  }
}

/**
 * Get leaderboard scores for friends only
 */
export async function getFriendsLeaderboard(userId: number, gameMode: "classic" | "puzzle", limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get friends leaderboard: database not available");
    return [];
  }

  try {
    const { desc, eq, inArray, and } = await import("drizzle-orm");
    
    // First get friend IDs (only accepted friendships)
    const friendsList = await db
      .select({ friendId: friendships.friendId })
      .from(friendships)
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.status, "accepted")
        )
      );

    const friendIds = friendsList.map(f => f.friendId);
    
    // Include current user in the list
    friendIds.push(userId);

    if (friendIds.length === 0) {
      return [];
    }

    // Get top scores for friends
    const result = await db
      .select({
        id: scores.id,
        userId: scores.userId,
        userName: users.nickname,
        userEmail: users.email,
        score: scores.score,
        level: scores.level,
        createdAt: scores.createdAt,
      })
      .from(scores)
      .leftJoin(users, eq(scores.userId, users.id))
      .where(
        and(
          inArray(scores.userId, friendIds),
          eq(scores.gameMode, gameMode)
        )
      )
      .orderBy(desc(scores.score))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get friends leaderboard:", error);
    return [];
  }
}
