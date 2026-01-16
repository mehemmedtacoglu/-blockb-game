import { useState, useCallback } from "react";
import { Cell } from "@/lib/gameLogic";
import { soundManager } from "@/lib/sound";
import { toast } from "sonner";

export function useBombSystem() {
  const [bombs, setBombs] = useState(3);
  const [bombMode, setBombMode] = useState(false);
  const [explodingCells, setExplodingCells] = useState<{ row: number; col: number }[]>([]);
  const [totalBombsUsed, setTotalBombsUsed] = useState(0);

  const resetBombs = useCallback(() => {
    setBombs(3);
    setBombMode(false);
    setExplodingCells([]);
    setTotalBombsUsed(0);
  }, []);

  const toggleBombMode = useCallback(() => {
    if (bombs <= 0) {
      toast.error("Bomba hakkınız kalmadı!");
      return;
    }
    setBombMode(prev => !prev);
  }, [bombs]);

  const useBomb = useCallback(
    (
      row: number,
      col: number,
      board: Cell[][],
      onBoardUpdate: (newBoard: Cell[][]) => void
    ) => {
      if (!bombMode || bombs <= 0 || !board[row][col].filled) {
        return;
      }

      // Get 3x3 area (center + 8 neighbors)
      const cellsToExplode: { row: number; col: number }[] = [];
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c].filled) {
            cellsToExplode.push({ row: r, col: c });
          }
        }
      }

      // Track bomb usage
      setTotalBombsUsed(prev => prev + 1);

      // Start explosion animation
      setExplodingCells(cellsToExplode);
      soundManager.playClear();

      // Clear cells after animation
      setTimeout(() => {
        const newBoard = board.map((r, rIdx) =>
          r.map((cell, cIdx) => {
            const shouldClear = cellsToExplode.some(
              c => c.row === rIdx && c.col === cIdx
            );
            if (shouldClear) {
              return { ...cell, filled: false, color: "" };
            }
            return cell;
          })
        );

        onBoardUpdate(newBoard);
        setExplodingCells([]);
        setBombs(prev => prev - 1);
        setBombMode(false);
        toast.success(`💥 Bomba patladı! Kalan: ${bombs - 1}`);
      }, 400);
    },
    [bombMode, bombs]
  );

  return {
    bombs,
    bombMode,
    explodingCells,
    totalBombsUsed,
    resetBombs,
    toggleBombMode,
    useBomb,
  };
}
