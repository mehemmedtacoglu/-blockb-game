import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, X, Users, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { useState } from "react";
import FriendSearch from "./FriendSearch";
import FriendsList from "./FriendsList";
import IncomingFriendRequests from "./IncomingFriendRequests";
import OutgoingFriendRequests from "./OutgoingFriendRequests";
import { useAuth } from "@/_core/hooks/useAuth";

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode?: "classic" | "puzzle";
}

export default function Leaderboard({ isOpen, onClose, gameMode = "classic" }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"global" | "friends" | "manage">("global");
  const { isAuthenticated } = useAuth();
  
  // Hide friends/manage tabs for non-authenticated users
  const showFriendsTabs = isAuthenticated;
  
  // Get incoming requests count for badge
  const { data: incomingRequests } = trpc.friends.getIncomingRequests.useQuery(
    undefined,
    { enabled: isOpen && isAuthenticated }
  );
  const incomingCount = incomingRequests?.length || 0;
  
  const { data: globalScores, isLoading: isLoadingGlobal } = trpc.leaderboard.getTopScores.useQuery(
    { gameMode, limit: 10 },
    { 
      enabled: isOpen && activeTab === "global",
      refetchInterval: 5000, // Refetch every 5 seconds for live updates
      refetchIntervalInBackground: false, // Only refetch when tab is active
    }
  );
  
  const { data: friendsScores, isLoading: isLoadingFriends } = trpc.friends.getFriendsLeaderboard.useQuery(
    { gameMode, limit: 10 },
    { 
      enabled: isOpen && activeTab === "friends" && isAuthenticated,
      refetchInterval: 5000, // Refetch every 5 seconds for live updates
      refetchIntervalInBackground: false,
    }
  );
  
  const scores = activeTab === "global" ? globalScores : friendsScores;
  const isLoading = activeTab === "global" ? isLoadingGlobal : isLoadingFriends;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-white/50 font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
      default:
        return "bg-black/40 border-white/10";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-black/90 border-2 border-neon-pink/50 rounded-2xl shadow-[0_0_50px_rgba(255,0,255,0.3)] overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neon-pink/20 to-purple-600/20 p-6 border-b border-white/10 relative flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-white to-neon-blue">
                    LEADERBOARD
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-white/60 uppercase tracking-wider">
                  Top 10 Players - {gameMode === "classic" ? "Classic Mode" : "Puzzle Mode"}
                </p>
                <motion.div
                  className="flex items-center gap-2 text-xs text-green-400"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Canlı</span>
                </motion.div>
              </div>
              
              {/* Tabs */}              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant={activeTab === "global" ? "default" : "outline"}
                  onClick={() => setActiveTab("global")}
                  className={cn(
                    showFriendsTabs ? "flex-1" : "w-full",
                    activeTab === "global" 
                      ? "bg-neon-blue text-white" 
                      : "bg-black/40 border-white/20 text-white/60 hover:text-white"
                  )}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Global
                </Button>
                {showFriendsTabs && (                  <>
                    <Button
                      size="sm"
                      variant={activeTab === "friends" ? "default" : "outline"}
                      onClick={() => setActiveTab("friends")}
                      className={cn(
                        "flex-1",
                        activeTab === "friends" 
                          ? "bg-neon-pink text-white" 
                          : "bg-black/40 border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Arkadaşlar
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === "manage" ? "default" : "outline"}
                      onClick={() => setActiveTab("manage")}
                      className={cn(
                        "flex-1 relative",
                        activeTab === "manage" 
                          ? "bg-green-500 text-white" 
                          : "bg-black/40 border-white/20 text-white/60 hover:text-white"
                      )}
                    >
                      Yönet
                      {incomingCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {incomingCount}
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {activeTab === "manage" ? (
                <div className="space-y-6">
                  {/* Incoming Requests */}
                  {incomingCount > 0 && (
                    <div>
                      <IncomingFriendRequests />
                    </div>
                  )}
                  
                  {/* Outgoing Requests */}
                  <div className={incomingCount > 0 ? "border-t border-white/10 pt-6" : ""}>
                    <OutgoingFriendRequests />
                  </div>
                  
                  {/* Friend Search */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white font-bold mb-3 text-lg">Arkadaş Ekle</h3>
                    <FriendSearch />
                  </div>
                  
                  {/* Friends List */}
                  <div className="border-t border-white/10 pt-6">
                    <FriendsList />
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-pink border-t-transparent"></div>
                </div>
              ) : scores && scores.length > 0 ? (
                <div className="space-y-3">
                  {scores.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                        getRankBg(index + 1)
                      )}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-lg truncate">
                          {entry.userName || (entry as any).guestNickname || "Anonymous Player"}
                        </p>
                        <p className="text-white/50 text-sm">
                          {new Date(entry.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-cyan-400">
                          {entry.score.toLocaleString()}
                        </p>
                        {entry.level && (
                          <p className="text-xs text-white/50">Level {entry.level}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 text-lg">No scores yet!</p>
                  <p className="text-white/30 text-sm mt-2">Be the first to set a record!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-neon-pink/10 to-purple-600/10 p-4 border-t border-white/10 text-center">
              <p className="text-white/40 text-sm">
                Play and compete with players around the world!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
