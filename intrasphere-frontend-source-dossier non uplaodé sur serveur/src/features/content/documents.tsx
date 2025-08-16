import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";
import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import type { Document } from "@shared/schema";

const categoryColors = {
  regulation: "bg-red-100 text-red-800",
  policy: "bg-blue-100 text-blue-800",
  guide: "bg-green-100 text-green-800",
  procedure: "bg-purple-100 text-purple-800"
};

const categoryLabels = {
  regulation: "Règlement",
  policy: "Politique",
  guide: "Guide",
  procedure: "Procédure"
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export default function Documents() {
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  return (
    <MainLayout>
      <div className="py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents & Règlements</h1>
          <p className="text-gray-600">Tous les documents officiels de l'entreprise</p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <GlassCard key={i} className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />  
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            documents?.map((document) => {
              const badgeColor = categoryColors[document.category as keyof typeof categoryColors] || categoryColors.guide;
              const categoryLabel = categoryLabels[document.category as keyof typeof categoryLabels] || document.category;
              
              return (
                <GlassCard 
                  key={document.id}
                  className="p-6 hover-lift cursor-pointer transition-all duration-300 animate-fade-in"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{document.title}</h3>
                      <Badge className={`${badgeColor} font-medium text-xs`}>
                        {categoryLabel}
                      </Badge>
                    </div>
                  </div>
                  
                  {document.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{document.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <p>Version {document.version}</p>
                      <p>Mis à jour le {formatDate(new Date(document.updatedAt))}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="p-2 rounded-lg hover:bg-gray-100">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 rounded-lg hover:bg-gray-100">
                        <Download className="h-4 w-4" />
                      </Button>
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
