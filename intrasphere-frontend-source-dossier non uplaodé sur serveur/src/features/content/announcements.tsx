import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Info, Calendar, GraduationCap, AlertTriangle, Plus } from "lucide-react";
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

export default function Announcements() {
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  return (
    <MainLayout>
      <div className="py-8 px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Annonces</h1>
            <p className="text-gray-600">Toutes les annonces de l'entreprise</p>
          </div>
          <Link to="/create-announcement">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nouvelle Annonce</span>
            </Button>
          </Link>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <GlassCard key={i} className="p-8">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            announcements?.map((announcement) => {
              const Icon = typeIcons[announcement.type as keyof typeof typeIcons] || Info;
              const colorClass = typeColors[announcement.type as keyof typeof typeColors] || typeColors.info;
              const badgeColor = badgeColors[announcement.type as keyof typeof badgeColors] || badgeColors.info;
              
              return (
                <GlassCard 
                  key={announcement.id}
                  className={`p-8 bg-gradient-to-r ${colorClass} border hover-lift cursor-pointer transition-all duration-300 animate-fade-in`}
                >
                  <div className="flex items-start space-x-6">
                    <div className="p-3 bg-primary rounded-2xl shadow-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
                        <Badge className={`${badgeColor} font-medium`}>
                          {announcement.type === 'important' && 'Important'}
                          {announcement.type === 'event' && 'Événement'}
                          {announcement.type === 'formation' && 'Formation'}
                          {announcement.type === 'info' && 'Info'}
                        </Badge>
                      </div>
                      <p className="text-gray-800 mb-4 leading-relaxed">{announcement.content}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <span>Publié par {announcement.authorName}</span>
                        <span className="mx-3">•</span>
                        <span>{formatTimeAgo(new Date(announcement.createdAt))}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
