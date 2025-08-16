import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Skeleton } from "@/core/components/ui/skeleton";
import type { Event } from "@shared/schema";

const eventColors = {
  meeting: "border-blue-500",
  training: "border-green-500", 
  social: "border-purple-500",
  other: "border-gray-500"
};

function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const upcomingEvents = events?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-gray-200 pl-4">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 animate-slide-up">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Événements Prochains</h3>
      <div className="space-y-4">
        {upcomingEvents.map((event) => {
          const borderColor = eventColors[event.type as keyof typeof eventColors] || eventColors.other;
          
          return (
            <div key={event.id} className={`border-l-4 ${borderColor} pl-4`}>
              <h4 className="font-medium text-gray-900">{event.title}</h4>
              <p className="text-sm text-gray-600">{formatEventDate(new Date(event.date))}</p>
              {event.location && (
                <p className="text-xs text-gray-500">{event.location}</p>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
