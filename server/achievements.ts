import { getDb } from "./db";
import { achievements, userAchievements, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
  // Combo Achievements
  { key: "combo_2x", name: "Çift Kombo", description: "2 satırı aynı anda temizle", category: "combo" as const, threshold: 2, icon: "🔥" },
  { key: "combo_3x", name: "Üçlü Kombo", description: "3 satırı aynı anda temizle", category: "combo" as const, threshold: 3, icon: "⚡" },
  { key: "combo_5x", name: "Beşli Kombo", description: "5 satırı aynı anda temizle", category: "combo" as const, threshold: 5, icon: "💥" },
  { key: "combo_8x", name: "Süper Kombo", description: "8 satırı aynı anda temizle", category: "combo" as const, threshold: 8, icon: "🌟" },
  
  // Survival Achievements (moves)
  { key: "survival_50", name: "Acemi Oyuncu", description: "50 hamle yap", category: "survival" as const, threshold: 50, icon: "🎮" },
  { key: "survival_100", name: "Deneyimli Oyuncu", description: "100 hamle yap", category: "survival" as const, threshold: 100, icon: "🎯" },
  { key: "survival_200", name: "Usta Oyuncu", description: "200 hamle yap", category: "survival" as const, threshold: 200, icon: "👑" },
  { key: "survival_500", name: "Efsane Oyuncu", description: "500 hamle yap", category: "survival" as const, threshold: 500, icon: "🏆" },
  
  // Score Achievements
  { key: "score_1000", name: "İlk Bin", description: "1,000 puana ulaş", category: "score" as const, threshold: 1000, icon: "🎊" },
  { key: "score_5000", name: "Beş Bin Kulübü", description: "5,000 puana ulaş", category: "score" as const, threshold: 5000, icon: "🎉" },
  { key: "score_10000", name: "On Bin Ustası", description: "10,000 puana ulaş", category: "score" as const, threshold: 10000, icon: "💎" },
  { key: "score_50000", name: "Skor Kralı", description: "50,000 puana ulaş", category: "score" as const, threshold: 50000, icon: "👑" },
  
  // Bomb Achievements
  { key: "bomb_10", name: "Bomba Kullanıcısı", description: "10 bomba kullan", category: "bomb" as const, threshold: 10, icon: "💣" },
  { key: "bomb_50", name: "Bomba Uzmanı", description: "50 bomba kullan", category: "bomb" as const, threshold: 50, icon: "💥" },
  { key: "bomb_100", name: "Bomba Ustası", description: "100 bomba kullan", category: "bomb" as const, threshold: 100, icon: "🧨" },
  
  // Lines Achievements
  { key: "lines_100", name: "Satır Temizleyici", description: "100 satır temizle", category: "lines" as const, threshold: 100, icon: "🧹" },
  { key: "lines_500", name: "Satır Ustası", description: "500 satır temizle", category: "lines" as const, threshold: 500, icon: "✨" },
  { key: "lines_1000", name: "Satır Efsanesi", description: "1,000 satır temizle", category: "lines" as const, threshold: 1000, icon: "🌈" },
];

/**
 * Initialize achievements in database (run once on server start or migration)
 */
export async function initializeAchievements() {
  try {
    const db = await getDb();
    if (!db) return;
    
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      // Check if achievement already exists
      const existing = await db.select().from(achievements).where(eq(achievements.key, def.key)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(achievements).values(def);
      }
    }
    console.log("[Achievements] Initialized successfully");
  } catch (error) {
    console.error("[Achievements] Initialization error:", error);
  }
}

/**
 * Check and unlock achievements for a user based on game stats
 */
export async function checkAndUnlockAchievements(
  userId: number,
  stats: {
    maxCombo?: number;
    moves?: number;
    score?: number;
    bombsUsed?: number;
    linesCleared?: number;
  }
) {
  const unlockedAchievements: Achievement[] = [];

  try {
    const db = await getDb();
    if (!db) return [];
    
    // Get all achievements
    const allAchievements = await db.select().from(achievements);
    
    // Get user's already unlocked achievements
    const userUnlocked = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    const unlockedIds = new Set(userUnlocked.map(ua => ua.achievementId));

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      let value = 0;

      // Check based on category
      switch (achievement.category) {
        case "combo":
          if (stats.maxCombo && stats.maxCombo >= achievement.threshold) {
            shouldUnlock = true;
            value = stats.maxCombo;
          }
          break;
        case "survival":
          if (stats.moves && stats.moves >= achievement.threshold) {
            shouldUnlock = true;
            value = stats.moves;
          }
          break;
        case "score":
          if (stats.score && stats.score >= achievement.threshold) {
            shouldUnlock = true;
            value = stats.score;
          }
          break;
        case "bomb":
          if (stats.bombsUsed && stats.bombsUsed >= achievement.threshold) {
            shouldUnlock = true;
            value = stats.bombsUsed;
          }
          break;
        case "lines":
          if (stats.linesCleared && stats.linesCleared >= achievement.threshold) {
            shouldUnlock = true;
            value = stats.linesCleared;
          }
          break;
      }

      if (shouldUnlock) {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          value,
        });
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error("[Achievements] Check error:", error);
  }

  return unlockedAchievements;
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];
    
    const result = await db
      .select({
        achievement: achievements,
        userAchievement: userAchievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return result.map((r: any) => ({
      ...r.achievement,
      unlockedAt: r.userAchievement.unlockedAt,
      value: r.userAchievement.value,
    }));
  } catch (error) {
    console.error("[Achievements] Get user achievements error:", error);
    return [];
  }
}

/**
 * Get all achievements with user's unlock status
 */
export async function getAllAchievementsWithStatus(userId: number | null) {
  try {
    const db = await getDb();
    if (!db) return [];
    
    const allAchievements = await db.select().from(achievements);
    
    if (!userId) {
      return allAchievements.map(a => ({ ...a, unlocked: false, unlockedAt: null, value: null }));
    }

    const userUnlocked = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
    
    const unlockedMap = new Map<number, { unlockedAt: Date; value: number }>(
      userUnlocked.map((ua: any) => [ua.achievementId as number, { unlockedAt: ua.unlockedAt as Date, value: ua.value as number }])
    );

    return allAchievements.map((a: any) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id)?.unlockedAt || null,
      value: unlockedMap.get(a.id)?.value || null,
    }));
  } catch (error) {
    console.error("[Achievements] Get all achievements error:", error);
    return [];
  }
}

type Achievement = typeof achievements.$inferSelect;
