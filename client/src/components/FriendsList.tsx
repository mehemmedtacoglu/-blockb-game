import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { UserMinus, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FriendsList() {
  const { data: friends, isLoading } = trpc.friends.getFriends.useQuery();
  const removeFriendMutation = trpc.friends.removeFriend.useMutation();
  const utils = trpc.useUtils();

  const handleRemoveFriend = async (friendId: number, friendName: string | null) => {
    if (!confirm(`${friendName || "Bu kullanıcıyı"} arkadaş listesinden çıkarmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await removeFriendMutation.mutateAsync({ friendId });
      toast.success(`${friendName || "Kullanıcı"} arkadaş listesinden çıkarıldı`);
      // Refresh friends list
      utils.friends.getFriends.invalidate();
      // Refresh leaderboard if it's open
      utils.friends.getFriendsLeaderboard.invalidate();
    } catch (error) {
      toast.error("Arkadaş çıkarılamadı");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-neon-blue" />
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="w-12 h-12 text-white/30 mb-3" />
        <p className="text-white/60">Henüz arkadaşınız yok</p>
        <p className="text-sm text-white/40 mt-1">Yukarıdan kullanıcı arayarak arkadaş ekleyin</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-neon-blue" />
        <h3 className="text-white font-bold">
          Arkadaşlarım ({friends.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {friends.map((friend) => (
          <div
            key={friend.friendshipId}
            className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg hover:border-neon-pink/50 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-white font-semibold">
                {friend.name || "İsimsiz Kullanıcı"}
              </span>
              {friend.email && (
                <span className="text-xs text-white/50">{friend.email}</span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRemoveFriend(friend.id, friend.name)}
              disabled={removeFriendMutation.isPending}
              className="bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-400 hover:text-red-300"
            >
              <UserMinus className="w-4 h-4 mr-1" />
              Çıkar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
