import { useState, useCallback, useRef } from "react";
import {
  Block,
  Cell,
  createEmptyBoard,
  generateRandomBlocks,
  placeBlock,
  canPlaceBlock,
  checkLines,
  checkGameOver,
} from "@/lib/gameLogic";

export interface GameState {
  board: Cell[][];
  availableBlocks: (Block | null)[];
  score: number;
  highScore: number;
  isGameOver: boolean;
  combo: number;
  level: number;
  moves: number;
  maxCombo: number;
  totalLinesCleared: number;
}

export function useGameState() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard());
  const [availableBlocks, setAvailableBlocks] = useState<(Block | null)[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalLinesCleared, setTotalLinesCleared] = useState(0);
  const [shake, setShake] = useState(false);
  const lastClearTimeRef = useRef(0);

  // Load high score from localStorage
  const loadHighScore = useCallback(() => {
    const saved = localStorage.getItem('blockBlastHighScore');
    if (saved) {
      setHighScore(parseInt(saved));
    }
  }, []);

  // Save high score to localStorage
  const saveHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('blockBlastHighScore', newScore.toString());
    }
  }, [highScore]);

  // Start new game
  const startNewGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setAvailableBlocks(generateRandomBlocks());
    setScore(0);
    setIsGameOver(false);
    setCombo(0);
    setLevel(1);
    setMoves(0);
    setMaxCombo(0);
    setTotalLinesCleared(0);
    setShake(false);
    lastClearTimeRef.current = 0;
  }, []);

  // Place block on board
  const placeBlockOnBoard = useCallback(
    (block: Block, row: number, col: number, blockIndex: number) => {
      if (!canPlaceBlock(board, block, row, col)) {
        return false;
      }

      // Place the block
      const newBoard = placeBlock(board, block, row, col);
      setBoard(newBoard);

      // Update moves
      setMoves(prev => prev + 1);

      // Remove the placed block
      const newBlocks = [...availableBlocks];
      newBlocks[blockIndex] = null;
      setAvailableBlocks(newBlocks);

      // Check for line clears
      const { newBoard: clearedBoard, score: clearScore, linesCleared } = checkLines(newBoard);
      
      if (linesCleared > 0) {
        setBoard(clearedBoard);
        
        // Update combo
        const now = Date.now();
        const timeSinceLastClear = now - lastClearTimeRef.current;
        const newCombo = timeSinceLastClear < 3000 ? combo + 1 : 1;
        setCombo(newCombo);
        lastClearTimeRef.current = now;

        // Update max combo
        if (newCombo > maxCombo) {
          setMaxCombo(newCombo);
        }

        // Update total lines cleared
        setTotalLinesCleared(prev => prev + linesCleared);

        // Calculate score with combo bonus
        const comboBonus = newCombo > 1 ? (newCombo - 1) * 100 : 0;
        const totalScore = clearScore + comboBonus;
        const newScore = score + totalScore;
        setScore(newScore);
        saveHighScore(newScore);

        // Update level based on score
        const newLevel = Math.floor(newScore / 1000) + 1;
        setLevel(newLevel);

        // Shake effect
        setShake(true);
        setTimeout(() => setShake(false), 200);
      } else {
        // Reset combo if no lines cleared
        setCombo(0);
      }

      // Generate new blocks if all are used
      if (newBlocks.every(b => b === null)) {
        setAvailableBlocks(generateRandomBlocks());
      }

      // Check game over
      const gameOver = checkGameOver(
        linesCleared > 0 ? clearedBoard : newBoard,
        newBlocks.every(b => b === null) ? generateRandomBlocks() : newBlocks
      );
      
      if (gameOver) {
        setIsGameOver(true);
      }

      return true;
    },
    [board, availableBlocks, score, combo, maxCombo, saveHighScore]
  );

  return {
    // State
    board,
    availableBlocks,
    score,
    highScore,
    isGameOver,
    combo,
    level,
    moves,
    maxCombo,
    totalLinesCleared,
    shake,
    
    // Actions
    startNewGame,
    placeBlockOnBoard,
    loadHighScore,
    setBoard,
    setAvailableBlocks,
    setIsGameOver,
  };
}
