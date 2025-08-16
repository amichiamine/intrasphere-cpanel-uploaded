import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const departmentColors: Record<string, string> = {
  "Direction": "bg-purple-100 text-purple-800",
  "Ressources Humaines": "bg-green-100 text-green-800",
  "Marketing": "bg-blue-100 text-blue-800",
  "IT": "bg-orange-100 text-orange-800",
  "Finance": "bg-red-100 text-red-800",
  "Design": "bg-pink-100 text-pink-800"
};

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: employees = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredEmployees = employees.filter(employee =>
    (employee.name && employee.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Annuaire</h1>
          <p className="text-gray-600">Trouvez facilement vos collègues</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card rounded-2xl border-0 focus:ring-2 focus:ring-primary shadow-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Employee Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Chargement des employés...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
            <GlassCard 
              key={employee.id}
              className="p-6 hover-lift cursor-pointer transition-all duration-300 animate-fade-in"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-lg">
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name || 'Avatar'}
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {(employee.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{employee.name || 'Nom non défini'}</h3>
                  <p className="text-gray-600 text-sm mb-2">{employee.position || 'Poste non défini'}</p>
                  <Badge className={`${departmentColors[employee.department || ''] || 'bg-gray-100 text-gray-800'} font-medium text-xs`}>
                    {employee.department || 'Département non défini'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {employee.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Employee ID: {employee.employeeId || 'Non défini'}</span>
                </div>
              </div>
            </GlassCard>
            ))}
            {!isLoading && filteredEmployees.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? `Aucun employé trouvé pour "${searchQuery}"` : 'Aucun employé trouvé'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
