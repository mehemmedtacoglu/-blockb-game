import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  nickname: varchar("nickname", { length: 20 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scores table for leaderboard functionality.
 * Stores high scores for both Classic and Puzzle modes.
 */
export const scores = mysqlTable("scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameMode: mysqlEnum("gameMode", ["classic", "puzzle"]).notNull(),
  score: int("score").notNull(),
  level: int("level").default(1),
  guestNickname: varchar("guestNickname", { length: 20 }), // For guest users (userId = 0)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;

/**
 * Friendships table for friend system.
 * Stores friend relationships between users.
 */
export const friendships = mysqlTable("friendships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who initiated the friendship
  friendId: int("friendId").notNull(), // User who was added as friend
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("accepted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

/**
 * Achievements table - defines all available achievements.
 * Static data that defines achievement criteria.
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(), // e.g., "combo_5x", "survival_100"
  name: varchar("name", { length: 100 }).notNull(), // Display name
  description: text("description").notNull(),
  category: mysqlEnum("category", ["combo", "survival", "score", "bomb", "lines"]).notNull(),
  threshold: int("threshold").notNull(), // Required value to unlock
  icon: varchar("icon", { length: 10 }).notNull(), // Emoji icon
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Achievements table - tracks which achievements users have unlocked.
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  value: int("value").notNull(), // The actual value achieved (e.g., combo of 7 for combo_5x)
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;