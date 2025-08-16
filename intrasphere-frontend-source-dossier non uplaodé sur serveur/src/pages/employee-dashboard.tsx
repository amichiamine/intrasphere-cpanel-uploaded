import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { useAuth } from "@/core/hooks/useAuth";
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Megaphone,
  BookOpen,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLocation } from "wouter";
import type { Announcement, Document, Event, Message, Complaint } from "@shared/schema";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch data with limited scope for employees
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id],
  });

  const { data: myComplaints = [] } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  // Filter data relevant to employee
  const recentAnnouncements = announcements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const unreadMessages = messages.filter(msg => !msg.isRead && msg.recipientId === user?.id);
  const userComplaints = myComplaints.filter(complaint => complaint.submitterId === user?.id);

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'important': return '🚨';
      case 'event': return '🎉';
      case 'formation': return '📚';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'important': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'formation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{
              background: `linear-gradient(to right, var(--color-primary, #8B5CF6), var(--color-secondary, #A78BFA))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Bonjour, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-600 mt-2">
              {user.position} • {user.department}
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              En ligne
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unreadMessages.length}</p>
                <p className="text-sm text-gray-600">Messages non lus</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{userComplaints.length}</p>
                <p className="text-sm text-gray-600">Mes réclamations</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-600">Événements à venir</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-600">Documents disponibles</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Megaphone className="w-5 h-5 mr-2" />
                  Dernières annonces
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/announcements")}
                >
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {recentAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucune annonce récente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-xl border border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getAnnouncementIcon(announcement.type)}</span>
                          <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        </div>
                        <Badge className={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Par {announcement.authorName}</span>
                        <span>{format(new Date(announcement.createdAt), "d MMM yyyy", { locale: fr })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Messages */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Messages récents
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/messages")}
                >
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {unreadMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucun nouveau message</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unreadMessages.slice(0, 3).map((message) => (
                    <div
                      key={message.id}
                      className="p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{message.subject}</h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          Nouveau
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>De: {message.senderId}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {message.createdAt ? format(new Date(message.createdAt), "HH:mm", { locale: fr }) : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Événements à venir
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/events")}
                >
                  Calendrier
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucun événement prévu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(event.date), "d MMM yyyy à HH:mm", { locale: fr })}
                        </span>
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* My Complaints */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Mes réclamations
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/complaints")}
                >
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {userComplaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50 text-green-500" />
                  <p>Aucune réclamation en cours</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setLocation("/complaints")}
                  >
                    Créer une réclamation
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userComplaints.slice(0, 3).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{complaint.title}</h4>
                        <Badge className={getComplaintStatusColor(complaint.status || "open")}>
                          {complaint.status || "Open"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {complaint.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Catégorie: {complaint.category}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {complaint.createdAt ? format(new Date(complaint.createdAt), "d MMM", { locale: fr }) : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Actions rapides
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setLocation("/messages")}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Messages</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setLocation("/complaints")}
              >
                <AlertTriangle className="w-6 h-6" />
                <span className="text-sm">Réclamation</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setLocation("/directory")}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Annuaire</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setLocation("/documents")}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">Documents</span>
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
}