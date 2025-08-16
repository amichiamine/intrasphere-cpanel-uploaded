import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Megaphone, FileText, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/core/components/ui/skeleton";

const statsIcons = {
  newAnnouncements: Megaphone,
  updatedDocuments: FileText,
  connectedUsers: Users,
  weeklyEvents: Calendar
};

const statsConfig = [
  { key: "newAnnouncements", label: "Nouvelles annonces", color: "from-blue-500 to-blue-600" },
  { key: "updatedDocuments", label: "Documents mis à jour", color: "from-green-500 to-green-600" },
  { key: "connectedUsers", label: "Employés connectés", color: "from-purple-500 to-purple-600" },
  { key: "weeklyEvents", label: "Événements cette semaine", color: "from-orange-500 to-orange-600" }
];

export function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((config) => {
        const Icon = statsIcons[config.key as keyof typeof statsIcons];
        const value = stats?.[config.key as keyof typeof stats] || 0;
        
        return (
          <GlassCard key={config.key} className="p-6 animate-fade-in">
            <div className="flex items-center">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${config.color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-gray-600">{config.label}</p>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
