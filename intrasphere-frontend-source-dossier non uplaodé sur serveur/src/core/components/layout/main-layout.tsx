import { useState } from "react";
import { useAuth } from "@/core/hooks/useAuth";
// Theme management is now handled by ThemeLoader component
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Separator } from "@/core/components/ui/separator";
import { useLocation, useRoute } from "wouter";
import { 
  Home, 
  Bell, 
  FileText, 
  Users, 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Building2,
  Plus,
  Eye,
  Palette,
  GraduationCap
} from "lucide-react";



interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const getNavItems = (): NavItem[] => [
  { label: "Tableau de bord", path: "/", icon: <Home className="w-4 h-4" /> },
  { label: "Annonces", path: "/announcements", icon: <Bell className="w-4 h-4" /> },
  { label: "Contenu", path: "/content", icon: <FileText className="w-4 h-4" /> },
  { label: "Documents", path: "/documents", icon: <FileText className="w-4 h-4" /> },
  { label: "Annuaire", path: "/directory", icon: <Users className="w-4 h-4" /> },
  { label: "Formation", path: "/training", icon: <GraduationCap className="w-4 h-4" /> },
  { label: "Messages", path: "/messages", icon: <MessageSquare className="w-4 h-4" /> },
  { label: "Réclamations", path: "/complaints", icon: <AlertTriangle className="w-4 h-4" /> },
  { 
    label: "Administration", 
    path: "/admin", 
    icon: <Shield className="w-4 h-4" />, 
    roles: ["admin", "moderator"] 
  },
  { 
    label: "Gestion des vues", 
    path: "/views-management", 
    icon: <Eye className="w-4 h-4" />, 
    roles: ["admin", "moderator"] 
  },
  { 
    label: "Admin Formation", 
    path: "/training-admin", 
    icon: <GraduationCap className="w-4 h-4" />, 
    roles: ["admin", "moderator"] 
  },
  { 
    label: "Créer annonce", 
    path: "/create-announcement", 
    icon: <Plus className="w-4 h-4" />, 
    roles: ["admin", "moderator"] 
  },
  { 
    label: "Créer contenu", 
    path: "/create-content", 
    icon: <Plus className="w-4 h-4" />, 
    roles: ["admin", "moderator"] 
  },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Theme is now managed by settings page and applied directly to DOM
  const [location, setLocation] = useLocation();
  
  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || "employee")
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "moderator": return "bg-blue-100 text-blue-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "moderator": return "Modérateur";
      default: return "Employé";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 w-72 h-full transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        backdrop-blur-lg bg-white/30 border-r border-white/20
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{
                    background: `linear-gradient(to right, var(--color-primary, #8B5CF6), var(--color-secondary, #A78BFA))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    IntraSphere
                  </h1>
                  <p className="text-xs text-gray-600">Votre portail d'entreprise connecté</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.position} • {user?.department}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <Badge className={getRoleBadgeColor(user?.role || "employee")}>
                {getRoleLabel(user?.role || "employee")}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`
                    w-full justify-start h-auto p-3 text-left
                    ${isActive 
                      ? "bg-white/60 text-purple-700 shadow-sm" 
                      : "text-gray-700 hover:bg-white/40"
                    }
                  `}
                  onClick={() => {
                    setLocation(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-white/40"
              onClick={() => setLocation("/settings")}
            >
              <Settings className="w-4 h-4" />
              <span className="ml-3">Paramètres</span>
            </Button>
            
            <Separator className="my-2" />
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-3">Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/20 backdrop-blur-lg bg-white/30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {navItems.find(item => item.path === location)?.label || "IntraSphere"}
                </h2>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString("fr-FR", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">

              <Button
                variant="ghost"
                size="sm"
                className="touch-manipulation active:scale-95 transition-transform duration-150 min-h-[44px] min-w-[44px] p-2"
                onClick={() => {
                  setLocation('/settings');
                }}
                aria-label="Paramètres de thème"
              >
                <Palette className="w-4 h-4" />
              </Button>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                En ligne
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}