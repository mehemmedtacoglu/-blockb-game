import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  canPlaceBlock,
  placeBlock,
  checkLines,
  checkGameOver,
  BOARD_SIZE,
  Block,
} from './gameLogic';

describe('gameLogic', () => {
  describe('createEmptyBoard', () => {
    it('should create an 8x8 empty board', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      expect(board[0]).toHaveLength(BOARD_SIZE);
      expect(board[0][0].filled).toBe(false);
    });
  });

  describe('canPlaceBlock', () => {
    it('should allow placing a block in empty space', () => {
      const board = createEmptyBoard();
      const block: Block = {
        shape: [[1, 1], [1, 1]],
        color: 'bg-cyan-400',
        id: 'test-1',
      };
      expect(canPlaceBlock(board, block, 0, 0)).toBe(true);
    });

    it('should not allow placing a block out of bounds', () => {
      const board = createEmptyBoard();
      const block: Block = {
        shape: [[1, 1], [1, 1]],
        color: 'bg-cyan-400',
        id: 'test-1',
      };
      expect(canPlaceBlock(board, block, 7, 7)).toBe(false);
    });

    it('should not allow placing a block on filled cells', () => {
      const board = createEmptyBoard();
      board[0][0].filled = true;
      const block: Block = {
        shape: [[1, 1], [1, 1]],
        color: 'bg-cyan-400',
        id: 'test-1',
      };
      expect(canPlaceBlock(board, block, 0, 0)).toBe(false);
    });
  });

  describe('placeBlock', () => {
    it('should place a block on the board', () => {
      const board = createEmptyBoard();
      const block: Block = {
        shape: [[1, 1], [1, 1]],
        color: 'bg-cyan-400',
        id: 'test-1',
      };
      const newBoard = placeBlock(board, block, 0, 0);
      
      expect(newBoard[0][0].filled).toBe(true);
      expect(newBoard[0][1].filled).toBe(true);
      expect(newBoard[1][0].filled).toBe(true);
      expect(newBoard[1][1].filled).toBe(true);
      expect(newBoard[0][0].color).toBe('bg-cyan-400');
    });

    it('should not modify the original board', () => {
      const board = createEmptyBoard();
      const block: Block = {
        shape: [[1]],
        color: 'bg-cyan-400',
        id: 'test-1',
      };
      placeBlock(board, block, 0, 0);
      
      expect(board[0][0].filled).toBe(false);
    });
  });

  describe('checkLines', () => {
    it('should detect a filled row', () => {
      const board = createEmptyBoard();
      // Fill first row
      for (let i = 0; i < BOARD_SIZE; i++) {
        board[0][i].filled = true;
      }
      
      const { clearedRows, score, linesCleared } = checkLines(board);
      expect(clearedRows).toContain(0);
      expect(linesCleared).toBe(1);
      expect(score).toBeGreaterThan(0);
    });

    it('should detect a filled column', () => {
      const board = createEmptyBoard();
      // Fill first column
      for (let i = 0; i < BOARD_SIZE; i++) {
        board[i][0].filled = true;
      }
      
      const { clearedCols, score, linesCleared } = checkLines(board);
      expect(clearedCols).toContain(0);
      expect(linesCleared).toBe(1);
      expect(score).toBeGreaterThan(0);
    });

    it('should calculate combo bonus correctly', () => {
      const board = createEmptyBoard();
      // Fill first row and first column
      for (let i = 0; i < BOARD_SIZE; i++) {
        board[0][i].filled = true;
        board[i][0].filled = true;
      }
      
      const { linesCleared, score } = checkLines(board);
      expect(linesCleared).toBe(2);
      // Base score: 2 * 100 = 200
      // Combo bonus: (2 - 1) * 50 = 50
      // Total: 250
      expect(score).toBe(250);
    });

    it('should return zero score when no lines are cleared', () => {
      const board = createEmptyBoard();
      board[0][0].filled = true;
      
      const { score, linesCleared } = checkLines(board);
      expect(linesCleared).toBe(0);
      expect(score).toBe(0);
    });
  });

  describe('checkGameOver', () => {
    it('should return false when blocks can be placed', () => {
      const board = createEmptyBoard();
      const blocks: Block[] = [
        {
          shape: [[1]],
          color: 'bg-cyan-400',
          id: 'test-1',
        },
      ];
      
      expect(checkGameOver(board, blocks)).toBe(false);
    });

    it('should return true when no blocks can be placed', () => {
      const board = createEmptyBoard();
      // Fill entire board
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          board[r][c].filled = true;
        }
      }
      
      const blocks: Block[] = [
        {
          shape: [[1]],
          color: 'bg-cyan-400',
          id: 'test-1',
        },
      ];
      
      expect(checkGameOver(board, blocks)).toBe(true);
    });

    it('should return false when all blocks are null', () => {
      const board = createEmptyBoard();
      const blocks: (Block | null)[] = [null, null, null];
      
      expect(checkGameOver(board, blocks)).toBe(false);
    });
  });
});
