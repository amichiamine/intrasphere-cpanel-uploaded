import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/core/components/ui/glass-card";
import { FileText } from "lucide-react";
import { Skeleton } from "@/core/components/ui/skeleton";
import type { Document } from "@shared/schema";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
}

export function RecentDocuments() {
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const recentDocuments = documents?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center p-3 rounded-2xl">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <div className="ml-3 flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 animate-slide-up">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Documents Récents</h3>
      <div className="space-y-3">
        {recentDocuments.map((doc) => (
          <div 
            key={doc.id}
            className="flex items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer hover-lift"
          >
            <div className="p-2 bg-red-100 rounded-xl">
              <FileText className="h-4 w-4 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
              <p className="text-xs text-gray-500">
                {doc.version ? `Version ${doc.version} • ` : ''}
                {formatTimeAgo(new Date(doc.updatedAt))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
