import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Achievements() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: achievements, isLoading } = trpc.achievements.getAllWithStatus.useQuery(
    { userId: user?.id },
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  // Group achievements by category
  const groupedAchievements = achievements?.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  const categoryNames: Record<string, string> = {
    combo: "🔥 Kombo Başarımları",
    survival: "🎮 Hayatta Kalma",
    score: "🎊 Skor Başarımları",
    bomb: "💣 Bomba Ustası",
    lines: "✨ Satır Temizleme",
  };

  const unlockedCount = achievements?.filter(a => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/block-blast">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-white to-neon-blue">
            BAŞARIMLAR
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Progress Card */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              İlerleme
            </CardTitle>
            <CardDescription className="text-white/60">
              {unlockedCount} / {totalCount} başarım açıldı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-white/60 mt-2">%{progress.toFixed(0)} tamamlandı</p>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        {groupedAchievements && Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white/90">
              {categoryNames[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(categoryAchievements as any[]).map((achievement: any) => (
                <Card
                  key={achievement.id}
                  className={cn(
                    "bg-white/5 border-white/10 transition-all duration-300",
                    achievement.unlocked
                      ? "border-neon-pink/50 shadow-[0_0_20px_rgba(255,0,255,0.3)]"
                      : "opacity-60"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{achievement.icon}</div>
                      {achievement.unlocked ? (
                        <Badge className="bg-neon-pink text-white">
                          Açıldı
                        </Badge>
                      ) : (
                        <Lock className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <CardTitle className="text-white mt-2">
                      {achievement.name}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Hedef:</span>
                      <span className="text-white font-bold">
                        {achievement.threshold}
                      </span>
                    </div>
                    {achievement.unlocked && achievement.value && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-neon-pink/80">Başarın:</span>
                        <span className="text-neon-pink font-bold">
                          {achievement.value}
                        </span>
                      </div>
                    )}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-white/40 mt-2">
                        {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(!achievements || achievements.length === 0) && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Henüz başarım yok</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
