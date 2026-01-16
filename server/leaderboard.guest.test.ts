import { describe, it, expect, beforeAll } from "vitest";
import { submitScore, getTopScores } from "./db";

describe("Guest User Score Submission", () => {
  beforeAll(async () => {
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("should allow guest users to submit scores with nickname", async () => {
    const guestScore = {
      userId: 0, // Special ID for guest users
      gameMode: "classic" as const,
      score: 1500,
      level: 5,
      guestNickname: "GuestPlayer123",
    };

    const result = await submitScore(guestScore);
    expect(result).toBeTruthy();
  });

  it("should retrieve guest user scores in leaderboard", async () => {
    // Submit a test guest score
    await submitScore({
      userId: 0,
      gameMode: "classic" as const,
      score: 2500,
      level: 8,
      guestNickname: "TestGuest",
    });

    // Get top scores
    const topScores = await getTopScores("classic", 10);
    
    // Check if guest scores are included
    const guestScores = topScores.filter((score: any) => score.guestNickname);
    expect(guestScores.length).toBeGreaterThan(0);
    
    // Check if guestNickname is properly returned
    const testGuestScore = topScores.find((score: any) => score.guestNickname === "TestGuest");
    expect(testGuestScore).toBeTruthy();
    if (testGuestScore) {
      expect((testGuestScore as any).guestNickname).toBe("TestGuest");
      expect(testGuestScore.score).toBe(2500);
    }
  });

  it("should differentiate between authenticated and guest users", async () => {
    // Submit authenticated user score (userId > 0)
    await submitScore({
      userId: 1,
      gameMode: "classic" as const,
      score: 3000,
      level: 10,
    });

    // Submit guest user score (userId = 0)
    await submitScore({
      userId: 0,
      gameMode: "classic" as const,
      score: 2800,
      level: 9,
      guestNickname: "GuestUser",
    });

    const topScores = await getTopScores("classic", 10);
    
    // Check that both types of scores are present
    const authScores = topScores.filter(score => score.userId > 0);
    const guestScores = topScores.filter((score: any) => score.userId === 0 && score.guestNickname);
    
    expect(authScores.length).toBeGreaterThan(0);
    expect(guestScores.length).toBeGreaterThan(0);
  });
});
