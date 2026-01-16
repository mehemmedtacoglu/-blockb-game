import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Gamepad2, Loader2 } from "lucide-react";
import { setGuestNickname } from "@/lib/guestMode";

interface GuestNicknameModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function GuestNicknameModal({ isOpen, onComplete }: GuestNicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedNickname = nickname.trim();
    
    if (trimmedNickname.length < 3) {
      toast.error("Nickname en az 3 karakter olmalı");
      return;
    }
    
    if (trimmedNickname.length > 20) {
      toast.error("Nickname en fazla 20 karakter olabilir");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save to localStorage
      setGuestNickname(trimmedNickname);
      toast.success(`Hoş geldin, ${trimmedNickname}! 🎮`);
      onComplete();
    } catch (error) {
      toast.error("Bir hata oluştu");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-black/95 border-2 border-neon-pink/50 backdrop-blur-xl max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-pink to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.6)]">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
            Misafir Olarak Oyna
          </DialogTitle>
          <DialogDescription className="text-white/60 text-center">
            Oyuna başlamak için bir takma ad seç
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm text-white/80 font-medium">
              Takma Ad (Nickname)
            </label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Örn: CyberGamer"
              maxLength={20}
              className="bg-black/40 border-neon-blue/50 text-white placeholder:text-white/40 focus:border-neon-pink"
              autoFocus
              disabled={isSubmitting}
            />
            <p className="text-xs text-white/50">
              3-20 karakter, harf, rakam ve alt çizgi kullanabilirsin
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || nickname.trim().length < 3}
            className="w-full bg-gradient-to-r from-neon-pink to-purple-600 hover:from-neon-pink/80 hover:to-purple-600/80 text-white font-bold py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Kaydediliyor...
              </>
            ) : (
              "Oyuna Başla"
            )}
          </Button>

          <p className="text-xs text-white/40 text-center">
            Misafir modunda oynuyorsun. Skorların kaydedilmeyecek.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
