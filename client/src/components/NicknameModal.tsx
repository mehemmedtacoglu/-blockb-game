import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Gamepad2, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface NicknameModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function NicknameModal({ isOpen, onComplete }: NicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [debouncedNickname, setDebouncedNickname] = useState("");
  const updateNicknameMutation = trpc.auth.updateNickname.useMutation();
  const utils = trpc.useUtils();
  
  // Debounce nickname input for availability check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNickname(nickname.trim());
    }, 500);
    
    return () => clearTimeout(timer);
  }, [nickname]);
  
  // Check nickname availability
  const { data: availabilityData, isLoading: isCheckingAvailability } = trpc.auth.checkNicknameAvailability.useQuery(
    { nickname: debouncedNickname },
    { 
      enabled: debouncedNickname.length >= 3 && debouncedNickname.length <= 20,
      retry: false,
    }
  );
  
  const isAvailable = availabilityData?.available;
  const showAvailability = debouncedNickname.length >= 3 && !isCheckingAvailability;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nickname.trim().length < 3) {
      toast.error("Nickname en az 3 karakter olmalı");
      return;
    }
    
    if (!isAvailable) {
      toast.error("Bu nickname zaten kullanılıyor");
      return;
    }

    try {
      const result = await updateNicknameMutation.mutateAsync({ nickname: nickname.trim() });
      
      if (result.success) {
        toast.success(`Hoş geldin, ${nickname}! \ud83c\udfae`);
        // Refresh user data
        utils.auth.me.invalidate();
        onComplete();
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Nickname kaydedilemedi");
      }
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-black/95 border-2 border-neon-pink/50 backdrop-blur-xl max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-pink to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.4)]">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-white to-neon-blue">
            Oyuna Hoş Geldin!
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            Liderlik tablosunda görünecek takma adını seç
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm text-white/80 font-medium">
              Takma Ad (Nickname)
            </label>
            <div className="relative">
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Örn: CyberGamer"
                maxLength={20}
                className="bg-black/40 border-neon-blue/50 text-white placeholder:text-white/40 focus:border-neon-pink pr-10"
                autoFocus
                disabled={updateNicknameMutation.isPending}
              />
              {isCheckingAvailability && debouncedNickname.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                </div>
              )}
              {showAvailability && isAvailable && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
              )}
              {showAvailability && !isAvailable && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
              )}
            </div>
            
            {showAvailability && !isAvailable && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Bu nickname zaten kullanılıyor
              </p>
            )}
            {showAvailability && isAvailable && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Bu nickname kullanılabilir!
              </p>
            )}
            {!showAvailability && (
              <p className="text-xs text-white/50">
                3-20 karakter, harf, rakam ve alt \u00e7izgi kullanabilirsin
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={updateNicknameMutation.isPending || nickname.trim().length < 3 || !isAvailable || isCheckingAvailability}
            className="w-full bg-gradient-to-r from-neon-pink to-purple-600 hover:from-neon-pink/80 hover:to-purple-600/80 text-white font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateNicknameMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Başla! 🚀"
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-white/40 mt-4">
          Daha sonra ayarlardan değiştirebilirsin
        </p>
      </DialogContent>
    </Dialog>
  );
}
