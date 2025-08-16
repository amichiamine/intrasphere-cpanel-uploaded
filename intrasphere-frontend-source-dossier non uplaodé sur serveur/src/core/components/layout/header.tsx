import { useState } from "react";
import { Search, Bell, MessageSquare, Menu } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="glass-effect border-b border-white/20 h-20 flex-shrink-0">
      <div className="flex items-center justify-between h-full px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 rounded-xl hover:bg-white/20"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-card rounded-2xl border-0 focus:ring-2 focus:ring-primary focus:outline-none text-gray-900 placeholder-gray-500 shadow-lg transition-all duration-300"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-3 glass-card rounded-2xl hover:bg-white/80 transition-all duration-300 hover-lift shadow-lg relative"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-3 glass-card rounded-2xl hover:bg-white/80 transition-all duration-300 hover-lift shadow-lg"
          >
            <MessageSquare className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </header>
  );
}
