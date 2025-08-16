import { GlassCard } from "@/core/components/ui/glass-card";
import { Users, Calendar, UserCheck, Headphones } from "lucide-react";
import { Link } from "wouter";

const quickLinks = [
  {
    name: "Annuaire",
    href: "/directory",
    icon: Users,
    color: "bg-blue-100 group-hover:bg-blue-200",
    iconColor: "text-blue-600"
  },
  {
    name: "Planning",
    href: "/calendar",
    icon: Calendar,
    color: "bg-green-100 group-hover:bg-green-200",
    iconColor: "text-green-600"
  },
  {
    name: "RH",
    href: "/hr",
    icon: UserCheck,
    color: "bg-purple-100 group-hover:bg-purple-200",
    iconColor: "text-purple-600"
  },
  {
    name: "Support IT",
    href: "/support",
    icon: Headphones,
    color: "bg-orange-100 group-hover:bg-orange-200",
    iconColor: "text-orange-600"
  }
];

export function QuickLinks() {
  return (
    <GlassCard className="p-6 animate-slide-up">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Accès Rapides</h3>
      <div className="space-y-3">
        {quickLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            <div className="flex items-center p-3 rounded-2xl hover:bg-blue-50 transition-colors duration-200 group hover-lift cursor-pointer">
              <div className={`p-2 ${link.color} rounded-xl transition-colors`}>
                <link.icon className={`h-4 w-4 ${link.iconColor}`} />
              </div>
              <span className="ml-3 font-medium text-gray-900">{link.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
