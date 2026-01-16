import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OutgoingFriendRequests() {
  const { data: requests, isLoading } = trpc.friends.getOutgoingRequests.useQuery();
  const cancelMutation = trpc.friends.cancelFriendRequest.useMutation();
  const utils = trpc.useUtils();

  const handleCancel = async (recipientId: number, recipientName: string | null) => {
    try {
      await cancelMutation.mutateAsync({ friendId: recipientId });
      toast.info(`${recipientName || "Kullanıcı"} isteği iptal edildi`);
      // Refresh outgoing requests
      utils.friends.getOutgoingRequests.invalidate();
    } catch (error) {
      toast.error("İstek iptal edilemedi");
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
        <Send className="w-12 h-12 text-white/30 mb-3" />
        <p className="text-white/60">Gönderilen istek yok</p>
        <p className="text-sm text-white/40 mt-1">Gönderdiğiniz istekler burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-5 h-5 text-neon-blue" />
        <h3 className="text-white font-bold">
          Gönderilen İstekler ({requests.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 bg-black/40 border border-neon-blue/30 rounded-lg hover:border-neon-blue/50 transition-colors"
          >
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-white font-semibold truncate">
                {request.recipientName || "İsimsiz Kullanıcı"}
              </span>
              {request.recipientEmail && (
                <span className="text-xs text-white/50 truncate">{request.recipientEmail}</span>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-yellow-400">Beklemede</span>
                <span className="text-xs text-white/40">
                  {new Date(request.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancel(request.recipientId, request.recipientName)}
              disabled={cancelMutation.isPending}
              className="bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-400 ml-2"
            >
              <X className="w-4 h-4 mr-1" />
              İptal
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
