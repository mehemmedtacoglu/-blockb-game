import DraggableBlock from "@/components/DraggableBlock";
import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getGuestNickname, getGuestUser } from "@/lib/guestMode";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import Leaderboard from "@/components/Leaderboard";
import NicknameModal from "@/components/NicknameModal";
import { Button } from "@/components/ui/button";
import {
  Block,
  canPlaceBlock,
  Cell,
  checkGameOver,
  checkLines,
  createEmptyBoard,
  generateRandomBlocks,
  placeBlock
} from "@/lib/gameLogic";
import { soundManager } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Trophy, Volume2, VolumeX } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { initTelegramWebApp, isTelegramWebApp, getTelegramUser, hapticFeedback, shareScore } from "@/lib/telegram";

export default function BlockBlast() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard());
  const [availableBlocks, setAvailableBlocks] = useState<(Block | null)[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);

  const [combo, setCombo] = useState(0);
  const [lastClearTime, setLastClearTime] = useState(0);
  const [shake, setShake] = useState(false);
  const [level, setLevel] = useState(1);
  const [autoRestartTimer, setAutoRestartTimer] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const currentTrackRef = useRef<string>('/background-music.mp3');
  const { user, isAuthenticated } = useAuth();
  const guestNickname = getGuestNickname();
  const isGuest = !isAuthenticated && !!guestNickname;
  const currentNickname = isAuthenticated ? user?.nickname : guestNickname;
  const submitScoreMutation = trpc.leaderboard.submitScore.useMutation();
  const checkAchievementsMutation = trpc.achievements.checkAndUnlock.useMutation({
    onSuccess: (data) => {
      if (data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach(achievement => {
          toast.success(`🏆 Başarım Açıldı: ${achievement.name}`, {
            description: achievement.description,
            duration: 5000,
          });
        });
      }
    },
  });
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [bombs, setBombs] = useState(3); // 3 bomb rights
  const [bombMode, setBombMode] = useState(false); // Bomb selection mode
  const [explodingCells, setExplodingCells] = useState<{row: number, col: number}[]>([]);
  
  // Achievement tracking
  const [moves, setMoves] = useState(0); // Total moves made
  const [maxCombo, setMaxCombo] = useState(0); // Highest combo achieved
  const [totalBombsUsed, setTotalBombsUsed] = useState(0); // Total bombs used
  const [totalLinesCleared, setTotalLinesCleared] = useState(0); // Total lines cleared
  
  // Check if user needs to set nickname (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user && !user.nickname) {
      setShowNicknameModal(true);
    }
  }, [isAuthenticated, user]);
  
  // Redirect to home if no nickname (neither guest nor authenticated)
  useEffect(() => {
    if (!isAuthenticated && !guestNickname) {
      // User is not authenticated and has no guest nickname
      // Redirect to home
      window.location.href = '/';
    }
  }, [isAuthenticated, guestNickname]);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (isTelegramWebApp()) {
      initTelegramWebApp();
      console.log('[Telegram] Mini App initialized');
      
      // Get Telegram user info
      const tgUser = getTelegramUser();
      if (tgUser) {
        console.log('[Telegram] User:', tgUser);
        // Auto-set nickname from Telegram
        if (!guestNickname && !isAuthenticated) {
          const nickname = tgUser.username || tgUser.first_name || `tg_${tgUser.id}`;
          localStorage.setItem('guestNickname', nickname);
        }
      }
    }
  }, []);

  // Load high score and init music
  useEffect(() => {
    const saved = localStorage.getItem('blockBlastHighScore');
    if (saved) setHighScore(parseInt(saved));
    startNewGame();

    // Initialize audio
    audioRef.current = new Audio('/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Lower volume for background

    // Try to play automatically (might be blocked by browser)
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsMusicPlaying(true);
      }).catch(error => {
        console.log("Auto-play prevented:", error);
        setIsMusicPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Dynamic music change based on level
  useEffect(() => {
    if (!audioRef.current) return;

    let newTrack = '/background-music.mp3';
    if (level >= 6) {
      newTrack = '/music-fast.mp3';
    } else if (level >= 3) {
      newTrack = '/music-medium.mp3';
    }

    // Only change if track is different
    if (newTrack !== currentTrackRef.current) {
      const wasPlaying = !audioRef.current.paused;
      
      // Fade out effect could be added here, but for now direct switch
      audioRef.current.src = newTrack;
      currentTrackRef.current = newTrack;
      audioRef.current.loop = true;
      
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [level]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
      setIsMusicPlaying(true);
    }
  };



  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('blockBlastHighScore', score.toString());
    }
  }, [score, highScore]);

   const handleBombClick = (row: number, col: number) => {
    if (!bombMode || bombs <= 0 || !board[row][col].filled) return;
    
    // Get 3x3 area (center + 8 neighbors)
    const cellsToExplode: {row: number, col: number}[] = [];
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
          const shouldClear = cellsToExplode.some(c => c.row === rIdx && c.col === cIdx);
          if (shouldClear) {
            return { ...cell, filled: false, color: '' };
          }
          return cell;
        })
      );
      
      setBoard(newBoard);
      setExplodingCells([]);
      setBombs(bombs - 1);
      setBombMode(false);
      toast.success(`💥 Bomba patladı! Kalan: ${bombs - 1}`);
    }, 400);
  };

  const startNewGame = () => {
    setBoard(createEmptyBoard());
    setAvailableBlocks(generateRandomBlocks());
    setScore(0);
    setIsGameOver(false);
    setCombo(0);
    setLevel(1);
    setAutoRestartTimer(null);
    setBombs(3); // Reset bombs to 3
    setBombMode(false);
    
    // Reset achievement tracking
    setMoves(0);
    setMaxCombo(0);
    setTotalBombsUsed(0);
    setTotalLinesCleared(0);
    
    soundManager.playPick();
  };;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 0, 
        tolerance: 3 // Daha hassas touch handling
      } 
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const block = active.data.current?.block as Block;
    setActiveBlock(block);
    soundManager.playPick();
  };

  // Rotate feature removed - blocks cannot be rotated

  const calculateGridPosition = (activeRect: { left: number; top: number; width: number; height: number }, activeBlock: Block | null) => {
    const boardElement = boardRef.current;
    if (!boardElement || !activeBlock) return null;

    const boardRect = boardElement.getBoundingClientRect();
    
    // Get first cell to calculate cell size
    const firstCell = boardElement.querySelector('[data-board-cell]');
    if (!firstCell) return null;
    
    const cellRect = firstCell.getBoundingClientRect();
    const cellSize = cellRect.width;
    const gap = 4; // gap-1 = 4px
    const padding = 8; // p-2 = 8px
    
    // Get block dimensions
    const blockHeight = activeBlock.shape.length;
    const blockWidth = activeBlock.shape[0].length;
    
    // Each cell takes up (cellSize + gap) pixels
    const cellStep = cellSize + gap;
    
    // Use CENTER of the block for better placement (especially for long blocks like 5x1)
    const blockCenterX = activeRect.left + (activeRect.width / 2);
    const blockCenterY = activeRect.top + (activeRect.height / 2);
    
    // Calculate position relative to board's top-left (accounting for padding)
    const relativeX = blockCenterX - boardRect.left - padding;
    const relativeY = blockCenterY - boardRect.top - padding;
    
    // Find which cell the CENTER is over
    const centerCol = Math.round(relativeX / cellStep);
    const centerRow = Math.round(relativeY / cellStep);
    
    // Calculate top-left position from center
    // For 1x1: center - 0 = center
    // For 2x2: center - 0 = top-left (because 2/2 - 1 = 0)
    // For 3x3: center - 1 = top-left (because 3/2 - 1 = 0.5 rounded down = 0, but (3-1)/2 = 1)
    // For 5x1: center - 2 = top-left (because (5-1)/2 = 2)
    const colIndex = centerCol - Math.floor(blockWidth / 2);
    const rowIndex = centerRow - Math.floor(blockHeight / 2);

    return { rowIndex, colIndex };
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active } = event;
    const rect = active.rect.current.translated;
    if (!rect) return;

    const pos = calculateGridPosition(rect, activeBlock);
    
    if (pos && pos.rowIndex >= 0 && pos.rowIndex < 8 && pos.colIndex >= 0 && pos.colIndex < 8) {
      const blockIndex = active.data.current?.index as number;
      const block = availableBlocks[blockIndex];
      
      // if (block && canPlaceBlock(board, block, pos.rowIndex, pos.colIndex)) {
      //   setGhostPosition({ row: pos.rowIndex, col: pos.colIndex });
      // } else {
      //   setGhostPosition(null);
      // }
    } else {
      // setGhostPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    setActiveBlock(null);
    // setGhostPosition(null);

    const rect = active.rect.current.translated;
    if (!rect) return;

    const pos = calculateGridPosition(rect, activeBlock);

    if (pos && pos.rowIndex >= 0 && pos.rowIndex < 8 && pos.colIndex >= 0 && pos.colIndex < 8) {
      const blockIndex = active.data.current?.index as number;
      const block = availableBlocks[blockIndex];
      
      if (block && canPlaceBlock(board, block, pos.rowIndex, pos.colIndex)) {
        // Immediate feedback - play sound first
        soundManager.playPlace();
        
        // Place block
        const newBoard = placeBlock(board, block, pos.rowIndex, pos.colIndex);
        
        // Track move
        setMoves(prev => prev + 1);
        
        // Check lines
        const { newBoard: boardAfterLines, score: points, linesCleared } = checkLines(newBoard);
        
        if (linesCleared > 0) {
          const now = Date.now();
          const timeDiff = now - lastClearTime;
          const newCombo = timeDiff < 2000 ? combo + 1 : 1;
          
          setCombo(newCombo);
          setLastClearTime(now);
          
          // Track combo and lines
          setMaxCombo(prev => Math.max(prev, newCombo));
          setTotalLinesCleared(prev => prev + linesCleared);
          setShake(true);
          setTimeout(() => setShake(false), 300);
          
          soundManager.playClear(newCombo);
          
          // Bonus score for combo
          const comboBonus = (newCombo - 1) * 50;
          const newScore = score + points + comboBonus + block.shape.flat().filter(x => x === 1).length;
          setScore(newScore);
          
          // Level up check
          const newLevel = Math.floor(newScore / 1000) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            soundManager.playClear(3); // Use strong sound for level up
            toast.success(`LEVEL UP! Welcome to Level ${newLevel}`, {
              style: { background: '#ffd700', color: 'black', fontWeight: 'bold', fontSize: '1.2rem' }
            });
          }

          if (newCombo > 1) {
            toast.success(`COMBO x${newCombo}!`, { 
              position: 'top-center',
              style: { background: '#ff00ff', color: 'white', fontWeight: 'bold' }
            });
          }
        } else {
          const newScore = score + points + block.shape.flat().filter(x => x === 1).length;
          setScore(newScore);
          
          // Level up check
          const newLevel = Math.floor(newScore / 1000) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            soundManager.playClear(3); // Use strong sound for level up
            toast.success(`LEVEL UP! Welcome to Level ${newLevel}`, {
              style: { background: '#ffd700', color: 'black', fontWeight: 'bold', fontSize: '1.2rem' }
            });
          }
        }
        
        setBoard(boardAfterLines);
        
        // Remove used block
        const newAvailable = [...availableBlocks];
        newAvailable[blockIndex] = null;
        
        // If all blocks used, generate new ones
        if (newAvailable.every(b => b === null)) {
          setAvailableBlocks(generateRandomBlocks(3));
        } else {
          setAvailableBlocks(newAvailable);
          
          if (checkGameOver(boardAfterLines, newAvailable)) {
            setIsGameOver(true);
            soundManager.playGameOver();
            toast.error("Game Over! No more moves possible.");
            
            // Submit score to leaderboard (both authenticated and guest users)
            if (isAuthenticated && user) {
              submitScoreMutation.mutate(
                { gameMode: "classic", score, level },
                {
                  onSuccess: () => {
                    toast.success("Score submitted to leaderboard!");
                  },
                  onError: (error) => {
                    console.error("Failed to submit score:", error);
                  }
                }
              );
              
              // Check achievements
              checkAchievementsMutation.mutate({
                maxCombo,
                moves,
                score,
                bombsUsed: totalBombsUsed,
                linesCleared: totalLinesCleared,
              });
            } else if (isGuest && guestNickname) {
              // Guest users - save scores with nickname
              submitScoreMutation.mutate(
                { gameMode: "classic", score, level, guestNickname },
                {
                  onSuccess: () => {
                    toast.success("Score submitted to leaderboard!");
                  },
                  onError: (error) => {
                    console.error("Failed to submit score:", error);
                  }
                }
              );
            } else {
              toast.info("Login to save your score!", {
                action: {
                  label: "Login",
                  onClick: () => window.location.href = getLoginUrl()
                }
              });
            }
            
            // Auto restart countdown
            let timeLeft = 3;
            setAutoRestartTimer(timeLeft);
            
            const timer = setInterval(() => {
              timeLeft -= 1;
              setAutoRestartTimer(timeLeft);
              
              if (timeLeft <= 0) {
                clearInterval(timer);
                startNewGame();
              }
            }, 1000);
          }
        }
      }
    }
  };



  // Level themes
  const getLevelTheme = () => {
    switch(level % 4) {
      case 1: return "from-neon-pink to-neon-blue"; // Default
      case 2: return "from-orange-500 to-red-600"; // Inferno
      case 3: return "from-green-400 to-cyan-500"; // Cyber Jungle
      case 0: return "from-yellow-400 to-purple-600"; // Royal (level 4, 8, etc)
      default: return "from-neon-pink to-neon-blue";
    }
  };

  const getLevelBg = () => {
    switch(level % 4) {
      case 1: return { p: "bg-primary/20", s: "bg-secondary/20" };
      case 2: return { p: "bg-orange-500/20", s: "bg-red-600/20" };
      case 3: return { p: "bg-green-400/20", s: "bg-cyan-500/20" };
      case 0: return { p: "bg-yellow-400/20", s: "bg-purple-600/20" };
      default: return { p: "bg-primary/20", s: "bg-secondary/20" };
    }
  };

  const theme = getLevelBg();

  const getScoreFontSize = (scoreNum: number) => {
    const len = scoreNum.toLocaleString().length;
    if (len > 15) return "text-lg"; // Trillions+
    if (len > 11) return "text-xl"; // Billions
    if (len > 8) return "text-2xl"; // Millions
    return "text-3xl"; // Default
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative transition-colors duration-1000">
        
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-1000">
          <div className={cn("absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[100px] rounded-full transition-colors duration-1000", theme.p)} />
          <div className={cn("absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[100px] rounded-full transition-colors duration-1000", theme.s)} />
        </div>

        {/* Header */}
        <div className="w-full max-w-4xl mb-8 z-10">
          {/* Main Header Row */}
          <div className="flex justify-between items-center gap-2 flex-wrap">
            {/* Level Badge */}
            <span className={cn(
              "text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full text-white bg-gradient-to-r shadow-lg",
              getLevelTheme()
            )}>
              LVL {level}
            </span>
            
            {/* Score & Best */}
            <div className="flex gap-2 sm:gap-3 flex-1 justify-center">
              <div className="flex flex-col items-center bg-black/40 px-3 py-1.5 sm:p-2 rounded-lg border border-neon-blue/30 shadow-[0_0_10px_rgba(0,255,255,0.1)] min-w-[70px] sm:min-w-[90px]">
                <span className="text-[8px] sm:text-[10px] text-neon-blue uppercase tracking-wider font-bold">Score</span>
                <span className="text-sm sm:text-lg font-black font-mono text-white drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] tabular-nums leading-none">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center bg-black/40 px-3 py-1.5 sm:p-2 rounded-lg border border-neon-pink/30 shadow-[0_0_10px_rgba(255,0,255,0.1)] min-w-[70px] sm:min-w-[90px]">
                <span className="text-[8px] sm:text-[10px] text-neon-pink uppercase tracking-wider font-bold">Best</span>
                <span className="text-sm sm:text-lg font-black font-mono text-white drop-shadow-[0_0_5px_rgba(255,0,255,0.8)] tabular-nums leading-none">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Bomb Button */}
              <Button
                variant="outline"
                size="icon"
                disabled={bombs <= 0 || isGameOver}
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center border-2 transition-all duration-300 relative",
                  bombMode 
                    ? "bg-red-500/30 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)]" 
                    : "bg-black/40 border-white/10 hover:bg-red-500/20 hover:border-red-500/50",
                  bombs <= 0 && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => setBombMode(!bombMode)}
              >
                <span className="text-lg sm:text-xl">💣</span>
                <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-red-600 rounded-full w-4 h-4 flex items-center justify-center">{bombs}</span>
              </Button>
              
              {/* Leaderboard Button */}
              {/* Achievements Button */}
              <Link href="/achievements">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center border-2 bg-black/40 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </Button>
              </Link>
              
              {/* Leaderboard Button */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center border-2 bg-black/40 border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-300"
                onClick={() => setIsLeaderboardOpen(true)}
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              </Button>
              
              {/* Music Toggle Button */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center border-2 bg-black/40 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 transition-all duration-300"
                onClick={toggleMusic}
              >
                {isMusicPlaying ? (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                ) : (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative z-10 mb-8">
          <div 
            ref={boardRef}
            className={cn(
              "grid grid-cols-8 gap-1 p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_0_30px_rgba(189,0,255,0.15)] transition-transform",
              shake && "animate-shake"
            )}
          >
            {board.map((row, rIndex) => (
              row.map((cell, cIndex) => (
                <div
                  key={`${rIndex}-${cIndex}`}
                  data-board-cell
                  data-row={rIndex}
                  data-col={cIndex}
                  onClick={() => handleBombClick(rIndex, cIndex)}
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md relative transition-colors duration-200",
                    "border border-white/5",
                    bombMode && cell.filled && "cursor-pointer hover:ring-2 hover:ring-red-500",
                    cell.filled 
                      ? cn(cell.color, "border-white/20 z-10") 
                      : "bg-white/5"
                  )}
                >
                  {/* Removed gradient overlay for solid colors */}
                  {/* Explosion Animation */}
                  {explodingCells.some(c => c.row === rIndex && c.col === cIndex) && (
                    <>
                      {/* Outer glow */}
                      <motion.div
                        initial={{ scale: 0.3, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 blur-lg"
                      />
                      {/* Middle burst */}
                      <motion.div
                        initial={{ scale: 0.5, opacity: 1, rotate: 0 }}
                        animate={{ scale: 2.5, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 blur-md"
                      />
                      {/* Inner flash */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 rounded-md bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                      />
                      {/* Sparkles */}
                      <motion.div
                        initial={{ scale: 1, opacity: 1, rotate: 0 }}
                        animate={{ scale: 2, opacity: 0, rotate: 360 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8)_0%,_transparent_50%)] blur-sm"
                      />
                    </>
                  )}
                </div>
              ))
            ))}
          </div>
          
          {/* Game Over Overlay */}
          <AnimatePresence>
            {isGameOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <h2 className="text-4xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">GAME OVER</h2>
                <p className="text-muted-foreground mb-4 text-xl">Final Score: <span className="text-white font-bold">{score.toLocaleString()}</span></p>
                
                {autoRestartTimer !== null && (
                  <p className="text-neon-blue font-bold mb-6 animate-pulse">
                    Restarting in {autoRestartTimer}...
                  </p>
                )}

                <Button 
                  onClick={startNewGame}
                  size="lg" 
                  className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold tracking-wider shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> TRY AGAIN NOW
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls / Blocks */}
        <div className="w-full max-w-md h-32 flex items-center justify-center gap-4 sm:gap-8 z-10">
          {availableBlocks.map((block, index) => (
            <div key={index} className="w-1/3 flex items-center justify-center h-full">
              {block && (
                <DraggableBlock 
                  key={block.id} 
                  block={block} 
                  index={index} 
                  disabled={isGameOver}
                />
              )}
            </div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeBlock ? (
            <div className="cursor-grabbing pointer-events-none opacity-100">
              <div className="grid gap-1" style={{ 
                gridTemplateColumns: `repeat(${activeBlock.shape[0].length}, minmax(0, 1fr))` 
              }}>
                {activeBlock.shape.map((row, r) => (
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-sm", // Match board cell size
                        cell === 1 
                          ? cn(activeBlock.color, "border border-white/20") 
                          : "bg-transparent"
                      )}
                    >
                      {/* Solid color, no gradient */}
                    </div>
                  ))
                ))}
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {/* Nickname Modal (First Time) */}
        <NicknameModal 
          isOpen={showNicknameModal} 
          onComplete={() => setShowNicknameModal(false)}
        />

        {/* Leaderboard Modal */}
        <Leaderboard 
          isOpen={isLeaderboardOpen} 
          onClose={() => setIsLeaderboardOpen(false)} 
          gameMode="classic"
        />
      </div>
    </DndContext>
  );
}
