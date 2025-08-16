import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { StatsCards } from "@/core/components/dashboard/stats-cards";
import { AnnouncementsFeed } from "@/core/components/dashboard/announcements-feed";
import { QuickLinks } from "@/core/components/dashboard/quick-links";
import { RecentDocuments } from "@/core/components/dashboard/recent-documents";
import { UpcomingEvents } from "@/core/components/dashboard/upcoming-events";

function getCurrentDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());
}

function getCurrentGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bonne après-midi";
  return "Bonsoir";
}

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="py-8 px-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <GlassCard className="gradient-overlay p-8 shadow-2xl hover-lift">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{getCurrentGreeting()}, Jean !</h1>
                <p className="text-white/90 text-lg">Bienvenue sur votre portail d'entreprise</p>
                <p className="text-white/75 mt-1">{getCurrentDate()}</p>
              </div>
              {/* Weather widget placeholder */}
              <div className="text-right text-white">
                <div className="text-2xl font-bold">22°C</div>
                <div className="text-white/75">Ensoleillé</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Stats Dashboard */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Announcements */}
          <AnnouncementsFeed />

          {/* Sidebar Content */}
          <div className="space-y-8">
            <QuickLinks />
            <RecentDocuments />
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
