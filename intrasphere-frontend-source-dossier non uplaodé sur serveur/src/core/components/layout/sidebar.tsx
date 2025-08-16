import { Link, useLocation } from "wouter";
import { cn } from "@/core/lib/utils";
import { 
  LayoutDashboard, 
  Megaphone, 
  FileText, 
  Users, 
  Archive, 
  Settings,
  Building2,
  MessageCircle,
  AlertTriangle,
  Shield,
  MessageSquare,
  GraduationCap
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Annonces", href: "/announcements", icon: Megaphone },
  { name: "Contenus", href: "/content", icon: Archive },
  { name: "Documents & Règlements", href: "/documents", icon: FileText },
  { name: "Annuaire", href: "/directory", icon: Users },
  { name: "Formations", href: "/trainings", icon: GraduationCap },
  { name: "Forum", href: "/forum", icon: MessageSquare },
  { name: "Messagerie", href: "/messages", icon: MessageCircle },
  { name: "Réclamations", href: "/complaints", icon: AlertTriangle },
  { name: "Administration", href: "/admin", icon: Shield },
  { name: "Gestion des Vues", href: "/views-management", icon: Settings },
];

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="flex lg:flex-shrink-0">
      <div className="flex flex-col w-80 lg:w-80 w-full">
        <div className="flex-1 flex flex-col min-h-0 sidebar-gradient border-r border-white/30 shadow-xl lg:rounded-none rounded-r-3xl">
          {/* Logo/Brand Section */}
          <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IntraSphere</h1>
                <p className="text-sm text-gray-600">Portail d'Entreprise</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 hover-lift",
                    isActive
                      ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg pulse-glow"
                      : "text-gray-700 hover:bg-white/60 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-6 mt-6 border-t border-white/20">
              <Link 
                href="/settings" 
                onClick={onClose}
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-2xl text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-all duration-300 hover-lift"
              >
                <Settings className="mr-3 h-5 w-5" />
                Paramètres
              </Link>
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-white/20">
            <div className="flex items-center glass-card rounded-2xl p-4 hover-lift cursor-pointer">
              <img 
                className="inline-block h-12 w-12 rounded-xl object-cover shadow-lg" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                alt="Photo de profil"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Jean Dupont</p>
                <p className="text-xs text-gray-600">Administrateur</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
