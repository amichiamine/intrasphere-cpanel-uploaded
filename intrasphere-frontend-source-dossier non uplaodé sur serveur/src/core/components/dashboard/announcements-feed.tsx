import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Info, Calendar, GraduationCap, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Link } from "wouter";
import type { Announcement } from "@shared/schema";

const typeIcons = {
  info: Info,
  important: AlertTriangle,
  event: Calendar,
  formation: GraduationCap
};

const typeColors = {
  info: "from-blue-50 to-indigo-50 border-blue-100",
  important: "from-red-50 to-pink-50 border-red-100", 
  event: "from-green-50 to-emerald-50 border-green-100",
  formation: "from-purple-50 to-violet-50 border-purple-100"
};

const badgeColors = {
  info: "bg-blue-100 text-blue-800",
  important: "bg-red-100 text-red-800",
  event: "bg-green-100 text-green-800",
  formation: "bg-purple-100 text-purple-800"
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Il y a moins d'une heure";
  if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
}

export function AnnouncementsFeed() {
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const recentAnnouncements = announcements?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <GlassCard className="lg:col-span-2">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="lg:col-span-2 animate-fade-in">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Annonces Récentes</h2>
          <Link href="/announcements">
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium rounded-xl px-4 py-2 hover:bg-primary/10 transition-colors duration-200">
              Voir tout
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentAnnouncements.map((announcement) => {
            const Icon = typeIcons[announcement.type as keyof typeof typeIcons] || Info;
            const colorClass = typeColors[announcement.type as keyof typeof typeColors] || typeColors.info;
            const badgeColor = badgeColors[announcement.type as keyof typeof badgeColors] || badgeColors.info;
            
            return (
              <div 
                key={announcement.id}
                className={`p-6 bg-gradient-to-r ${colorClass} rounded-2xl border hover-lift cursor-pointer transition-all duration-300`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary rounded-xl">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Publié par {announcement.authorName}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTimeAgo(new Date(announcement.createdAt))}</span>
                      <div className="ml-auto">
                        <Badge className={`${badgeColor} font-medium`}>
                          {announcement.type === 'important' && 'Important'}
                          {announcement.type === 'event' && 'Événement'}
                          {announcement.type === 'formation' && 'Formation'}
                          {announcement.type === 'info' && 'Info'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
