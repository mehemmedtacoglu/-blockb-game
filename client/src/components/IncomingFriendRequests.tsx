import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { UserCheck, UserX, Loader2, Inbox } from "lucide-react";
import { toast } from "sonner";

export default function IncomingFriendRequests() {
  const { data: requests, isLoading } = trpc.friends.getIncomingRequests.useQuery();
  const acceptMutation = trpc.friends.acceptFriendRequest.useMutation();
  const rejectMutation = trpc.friends.rejectFriendRequest.useMutation();
  const utils = trpc.useUtils();

  const handleAccept = async (requesterId: number, requesterName: string | null) => {
    try {
      const result = await acceptMutation.mutateAsync({ requesterId });
      
      if (result?.success) {
        toast.success(`${requesterName || "Kullanıcı"} arkadaş olarak eklendi!`);
        // Refresh all friend-related queries
        utils.friends.getIncomingRequests.invalidate();
        utils.friends.getFriends.invalidate();
        utils.friends.getFriendsLeaderboard.invalidate();
      } else {
        toast.error(result?.message || "İstek onaylanamadı");
      }
    } catch (error) {
      toast.error("İstek onaylanamadı");
      console.error(error);
    }
  };

  const handleReject = async (requesterId: number, requesterName: string | null) => {
    try {
      await rejectMutation.mutateAsync({ requesterId });
      toast.info(`${requesterName || "Kullanıcı"} isteği reddedildi`);
      // Refresh incoming requests
      utils.friends.getIncomingRequests.invalidate();
    } catch (error) {
      toast.error("İstek reddedilemedi");
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

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Inbox className="w-12 h-12 text-white/30 mb-3" />
        <p className="text-white/60">Gelen istek yok</p>
        <p className="text-sm text-white/40 mt-1">Yeni arkadaş istekleri burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Inbox className="w-5 h-5 text-neon-pink" />
        <h3 className="text-white font-bold">
          Gelen İstekler ({requests.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 bg-black/40 border border-neon-pink/30 rounded-lg hover:border-neon-pink/50 transition-colors"
          >
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-white font-semibold truncate">
                {request.requesterName || "İsimsiz Kullanıcı"}
              </span>
              {request.requesterEmail && (
                <span className="text-xs text-white/50 truncate">{request.requesterEmail}</span>
              )}
              <span className="text-xs text-white/40 mt-1">
                {new Date(request.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <div className="flex gap-2 ml-2">
              <Button
                size="sm"
                onClick={() => handleAccept(request.requesterId, request.requesterName)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400"
              >
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(request.requesterId, request.requesterName)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-400"
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
