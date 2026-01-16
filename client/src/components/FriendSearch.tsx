import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchQuery$ = trpc.friends.searchUsers.useQuery(
    { query: searchQuery.trim(), limit: 10 },
    { enabled: false } // Manual trigger
  );
  const sendRequestMutation = trpc.friends.sendFriendRequest.useMutation();
  const utils = trpc.useUtils();

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast.error("Lütfen en az 2 karakter girin");
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await searchQuery$.refetch();
      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info("Kullanıcı bulunamadı");
      }
    } catch (error) {
      toast.error("Arama başarısız oldu");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (friendId: number, friendName: string | null) => {
    try {
      const result = await sendRequestMutation.mutateAsync({ friendId });
      
      if (result?.success) {
        toast.success(`${friendName || "Kullanıcı"} istek gönderildi!`);
        // Refresh outgoing requests
        utils.friends.getOutgoingRequests.invalidate();
        // Remove from search results
        setSearchResults(prev => prev.filter(u => u.id !== friendId));
      } else {
        toast.error(result?.message || "Bu kullanıcıya zaten istek gönderilmiş");
      }
    } catch (error: any) {
      if (error.message?.includes("already sent")) {
        toast.error("Bu kullanıcıya zaten istek gönderilmiş");
      } else if (error.message?.includes("Already friends")) {
        toast.error("Bu kullanıcı zaten arkadaşınız");
      } else {
        toast.error("İstek gönderilemedi");
      }
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Kullanıcı adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || searchQuery.trim().length < 2}
          className="bg-neon-blue hover:bg-neon-blue/80"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Ara"
          )}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg hover:border-neon-blue/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-white font-semibold">
                  {user.name || "İsimsiz Kullanıcı"}
                </span>
                {user.email && (
                  <span className="text-xs text-white/50">{user.email}</span>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.id, user.name)}
                disabled={sendRequestMutation.isPending}
                className="bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/50 text-blue-400"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                İstek Gönder
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
