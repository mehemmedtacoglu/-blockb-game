import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Trophy, Sparkles, Crown, Medal } from "lucide-react";
import { useLocation } from "wouter";
import Leaderboard from "@/components/Leaderboard";
import NicknameModal from "@/components/NicknameModal";
import { useState, useEffect } from "react";
import { setGuestNickname, getGuestNickname } from "@/lib/guestMode";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [, setLocation] = useLocation();
  
  // Mutation for updating nickname
  const updateNicknameMutation = trpc.auth.updateNickname.useMutation({
    onSuccess: (data) => {
      toast.success(`Nickname güncellendi: ${data.nickname}`);
      setLocation('/block-blast');
    },
    onError: (error) => {
      toast.error(error.message || "Nickname güncellenirken hata oluştu");
    },
  });

  // Fetch top 5 scores for preview
  const { data: topScores } = trpc.leaderboard.getTopScores.useQuery(
    { gameMode: "classic", limit: 5 },
    { refetchInterval: 10000 }
  );

  // Check if user needs to set nickname on first login
  useEffect(() => {
    if (isAuthenticated && user && !user.nickname) {
      setShowNicknameModal(true);
    }
  }, [isAuthenticated, user]);

  const handleStartGame = () => {
    if (!nickname.trim()) {
      toast.error("Lütfen bir nickname girin!");
      return;
    }

    if (nickname.trim().length < 3) {
      toast.error("Nickname en az 3 karakter olmalı!");
      return;
    }

    if (nickname.trim().length > 20) {
      toast.error("Nickname en fazla 20 karakter olabilir!");
      return;
    }

    // If authenticated user, update nickname on server
    if (isAuthenticated && user) {
      updateNicknameMutation.mutate({ nickname: nickname.trim() });
    } else {
      // For guest users, save to localStorage
      setGuestNickname(nickname.trim());
      toast.success(`Hoş geldin, ${nickname.trim()}! 🎮`);
      setLocation('/block-blast');
    }
  };

  const handleQuickPlay = () => {
    if (isAuthenticated && user?.nickname) {
      setLocation('/block-blast');
    } else {
      const existingNickname = getGuestNickname();
      if (existingNickname) {
        setLocation('/block-blast');
      } else {
        toast.error("Lütfen önce nickname girin!");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartGame();
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-white/50 font-bold text-sm">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-neon-pink/20 blur-[150px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-neon-blue/20 blur-[150px] rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-start">
        {/* Left Side - Game Start */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-white to-neon-blue drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] mb-4">
              BLOCK BLAST
            </h1>
            <p className="text-lg text-white/60 tracking-widest uppercase font-light">
              Cyberpunk Puzzle Challenge
            </p>
          </div>

          {/* Nickname Input */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-pink to-neon-blue rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-pink" />
                  Nickname Girin
                </label>
                <Input
                  type="text"
                  placeholder="Nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-neon-blue focus:ring-neon-blue text-lg h-12 rounded-xl"
                  maxLength={20}
                  autoFocus
                />
                <p className="text-white/40 text-xs">3-20 karakter arası</p>
              </div>
            </div>
          </div>

          {/* START Button */}
          <button
            onClick={handleStartGame}
            disabled={!nickname.trim() || nickname.trim().length < 3}
            className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-pink via-purple-600 to-neon-blue rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-r from-neon-pink via-purple-600 to-neon-blue p-1 rounded-2xl">
              <div className="bg-black rounded-xl py-6 px-8 group-hover:bg-black/50 transition-colors duration-300">
                <span className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-pink to-white tracking-wider flex items-center justify-center gap-3">
                  <Grid3X3 className="w-8 h-8 text-neon-pink" />
                  START
                </span>
              </div>
            </div>
          </button>

          {/* Quick Play for Returning Users */}
          {((isAuthenticated && user?.nickname) || getGuestNickname()) && (
            <div className="text-center">
              <p className="text-white/60 text-sm mb-3">
                {isAuthenticated && user?.nickname 
                  ? `Hoş geldin, ${user.nickname}!` 
                  : `Hoş geldin, ${getGuestNickname()}!`}
              </p>
              <Button
                onClick={handleQuickPlay}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Hemen Oyna
              </Button>
            </div>
          )}

          {/* OAuth Login Option */}
          {!isAuthenticated && (
            <div className="text-center">
              <p className="text-white/40 text-sm mb-3">veya</p>
              <Button
                variant="outline"
                onClick={() => window.location.href = getLoginUrl()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Kayıt Ol (Skorları Kaydet)
              </Button>
            </div>
          )}
        </motion.div>

        {/* Right Side - Leaderboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    LEADERBOARD
                  </h2>
                </div>
                <motion.div
                  className="flex items-center gap-2 text-xs text-green-400"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Canlı</span>
                </motion.div>
              </div>

              {/* Top 5 Players */}
              <div className="space-y-2">
                {topScores && topScores.length > 0 ? (
                  topScores.map((player, index) => (
                    <div
                      key={`${player.id}-${index}`}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50"
                          : index === 2
                          ? "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50"
                          : "bg-black/40 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{player.userName || (player as any).guestNickname || 'Anonim'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black font-mono text-lg">
                          {player.score.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <p>Henüz skor yok</p>
                    <p className="text-sm mt-2">İlk sen ol! 🎮</p>
                  </div>
                )}
              </div>

              {/* View Full Leaderboard */}
              <Button
                variant="outline"
                onClick={() => setIsLeaderboardOpen(true)}
                className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Tüm Sıralamayı Gör
              </Button>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-black/60 backdrop-blur-sm border border-neon-pink/20 rounded-xl p-3">
              <div className="w-8 h-8 mx-auto mb-2 bg-neon-pink/20 rounded-lg flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-neon-pink" />
              </div>
              <p className="text-white/60 text-xs">Sürükle & Bırak</p>
            </div>
            <div className="bg-black/60 backdrop-blur-sm border border-red-500/20 rounded-xl p-3">
              <div className="w-8 h-8 mx-auto mb-2 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">💣</span>
              </div>
              <p className="text-white/60 text-xs">3 Bomba</p>
            </div>
            <div className="bg-black/60 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-3">
              <div className="w-8 h-8 mx-auto mb-2 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-white/60 text-xs">Canlı Skor</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nickname Modal (First Time - Authenticated Users) */}
      <NicknameModal 
        isOpen={showNicknameModal} 
        onComplete={() => {
          setShowNicknameModal(false);
          setLocation('/block-blast');
        }}
      />

      {/* Leaderboard Modal */}
      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
        gameMode="classic"
      />
    </div>
  );
}
