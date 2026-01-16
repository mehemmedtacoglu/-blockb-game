import { Cell } from "@/lib/gameLogic";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GameBoardProps {
  board: Cell[][];
  onCellClick?: (row: number, col: number) => void;
  highlightCells?: { row: number, col: number }[];
}

export default function GameBoard({ board, onCellClick, highlightCells = [] }: GameBoardProps) {
  const isHighlighted = (r: number, c: number) => {
    return highlightCells.some(cell => cell.row === r && cell.col === c);
  };

  return (
    <div className="grid grid-cols-8 gap-1 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      {board.map((row, rIndex) => (
        row.map((cell, cIndex) => (
          <div
            key={`${rIndex}-${cIndex}`}
            data-board-cell
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md transition-all duration-200 relative",
              "border border-white/5",
              cell.filled 
                ? cn(cell.color, "border-white/20") 
                : "bg-white/5",
              isHighlighted(rIndex, cIndex) && !cell.filled && "bg-white/20"
            )}
            onClick={() => onCellClick?.(rIndex, cIndex)}
          >
            {/* Solid color blocks */}
          </div>
        ))
      ))}
    </div>
  );
}
