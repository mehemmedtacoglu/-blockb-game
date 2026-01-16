// Game constants
export const BOARD_SIZE = 8;
export const BLOCK_TYPES = [
  // Single blocks
  [[1]],
  
  // Line blocks
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  
  // Square blocks
  [[1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  
  // L shapes
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  
  // T shapes
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
  [[0, 1], [1, 1], [0, 1]],
  
  // Z shapes
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 1], [0, 1]],
  [[0, 1], [1, 1], [1, 0]]
];

export const COLORS = [
  'bg-cyan-400',
  'bg-fuchsia-500',
  'bg-yellow-400',
  'bg-green-400',
  'bg-red-500',
  'bg-blue-500',
  'bg-orange-400'
];

export type Cell = {
  filled: boolean;
  color?: string;
  id?: string; // For animation keys
};

export type Block = {
  shape: number[][];
  color: string;
  id: string;
};

export const createEmptyBoard = (): Cell[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null).map(() => ({ filled: false }))
  );
};

export const generateRandomBlocks = (count: number = 3): Block[] => {
  const blocks: Block[] = [];
  for (let i = 0; i < count; i++) {
    const shapeIndex = Math.floor(Math.random() * BLOCK_TYPES.length);
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    blocks.push({
      shape: BLOCK_TYPES[shapeIndex],
      color: COLORS[colorIndex],
      id: Math.random().toString(36).substr(2, 9)
    });
  }
  return blocks;
};

export const rotateBlockShape = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  const newShape = Array(cols).fill(0).map(() => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newShape[c][rows - 1 - r] = shape[r][c];
    }
  }
  return newShape;
};

export const canPlaceBlock = (board: Cell[][], block: Block, row: number, col: number): boolean => {
  const shape = block.shape;
  const height = shape.length;
  const width = shape[0].length;

  // Check boundaries
  if (row + height > BOARD_SIZE || col + width > BOARD_SIZE) {
    return false;
  }

  // Check overlap
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (shape[r][c] === 1 && board[row + r][col + c].filled) {
        return false;
      }
    }
  }

  return true;
};

export const placeBlock = (board: Cell[][], block: Block, row: number, col: number): Cell[][] => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const shape = block.shape;
  
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c] === 1) {
        newBoard[row + r][col + c] = {
          filled: true,
          color: block.color,
          id: `${block.id}-${r}-${c}`
        };
      }
    }
  }
  
  return newBoard;
};

export const checkLines = (board: Cell[][]): { newBoard: Cell[][], clearedRows: number[], clearedCols: number[], score: number, linesCleared: number } => {
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];
  
  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(cell => cell.filled)) {
      rowsToClear.push(r);
    }
  }
  
  // Check cols
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every(row => row[c].filled)) {
      colsToClear.push(c);
    }
  }
  
  if (rowsToClear.length === 0 && colsToClear.length === 0) {
    return { newBoard: board, clearedRows: [], clearedCols: [], score: 0, linesCleared: 0 };
  }
  
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  // Clear rows
  rowsToClear.forEach(r => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = { filled: false };
    }
  });
  
  // Clear cols
  colsToClear.forEach(c => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = { filled: false };
    }
  });
  
  // Calculate score
  // Base score for lines + bonus for combos
  const totalLines = rowsToClear.length + colsToClear.length;
  const score = totalLines * 100 + (totalLines > 1 ? (totalLines - 1) * 50 : 0);
  
  return { newBoard, clearedRows: rowsToClear, clearedCols: colsToClear, score, linesCleared: totalLines };
};

export const checkGameOver = (board: Cell[][], availableBlocks: (Block | null)[]): boolean => {
  // If no blocks left to place, it's not game over (new blocks will be generated)
  if (availableBlocks.every(b => b === null)) return false;

  // Check if ANY available block can be placed ANYWHERE
  for (const block of availableBlocks) {
    if (block === null) continue;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlaceBlock(board, block, r, c)) {
          return false; // Found a valid move
        }
      }
    }
  }
  
  return true; // No valid moves found
};
