import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Building2, 
  Users, 
  Globe, 
  ArrowRight, 
  Shield, 
  Clock,
  Bell,
  FileText,
  Calendar,
  MessageSquare
} from "lucide-react";

interface PublicStats {
  totalAnnouncements: number;
  totalDocuments: number;
  totalUsers: number;
  totalEvents: number;
}

export default function PublicDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats } = useQuery<PublicStats>({
    queryKey: ["/api/stats"],
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const publicAnnouncements = announcements.filter((a: any) => a.isPublic).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold" style={{
              background: `linear-gradient(to right, var(--color-primary, #8B5CF6), var(--color-secondary, #A78BFA))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              IntraSphere
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Votre portail d'entreprise moderne pour une communication fluide et une collaboration efficace
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8"
              onClick={() => setLocation("/login")}
            >
              <Shield className="w-5 h-5 mr-2" />
              Se connecter
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-purple-200 hover:bg-purple-50"
            >
              <Globe className="w-5 h-5 mr-2" />
              Explorer en tant qu'invité
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annonces</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.totalAnnouncements || 0}</div>
              <p className="text-xs text-gray-600">Communications actives</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.totalDocuments || 0}</div>
              <p className="text-xs text-gray-600">Ressources disponibles</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Équipe</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-600">Collaborateurs</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats?.totalEvents || 0}</div>
              <p className="text-xs text-gray-600">À venir</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Public Announcements */}
          <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Annonces publiques</span>
              </CardTitle>
              <CardDescription>
                Les dernières nouvelles de l'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {publicAnnouncements.length > 0 ? (
                publicAnnouncements.map((announcement: any) => (
                  <div key={announcement.id} className="p-4 rounded-xl bg-white/50 border border-white/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {announcement.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary"
                            className={
                              announcement.category === "important" 
                                ? "bg-red-100 text-red-800" 
                                : announcement.category === "info"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {announcement.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(announcement.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune annonce publique pour le moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span>Fonctionnalités</span>
              </CardTitle>
              <CardDescription>
                Découvrez nos outils de collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/40">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Messagerie interne</h4>
                    <p className="text-sm text-gray-600">Communication sécurisée entre équipes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/40">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Gestion documentaire</h4>
                    <p className="text-sm text-gray-600">Centralisation et partage de fichiers</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/40">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Annuaire d'entreprise</h4>
                    <p className="text-sm text-gray-600">Trouvez facilement vos collègues</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/40">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Événements</h4>
                    <p className="text-sm text-gray-600">Suivez les actualités de l'entreprise</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                onClick={() => setLocation("/login")}
              >
                Rejoindre la plateforme
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Prêt à commencer ?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Rejoignez votre équipe sur IntraSphere et découvrez une nouvelle façon de collaborer. 
                  Accédez à tous vos outils professionnels depuis une seule plateforme.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8"
                  onClick={() => setLocation("/login")}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Connexion employé
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-gray-300 hover:bg-gray-50"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Demander l'accès
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Besoin d'aide ? Contactez votre administrateur système</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}