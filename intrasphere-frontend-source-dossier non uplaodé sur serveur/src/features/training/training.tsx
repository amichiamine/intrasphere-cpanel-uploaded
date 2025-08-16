import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/core/lib/queryClient";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Progress } from "@/core/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { BookOpen, Clock, Award, Star, Users, Filter, Search, PlayCircle, FileText, Download } from "lucide-react";
import type { Course, Enrollment, Resource } from "@shared/schema";

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800", 
  advanced: "bg-red-100 text-red-800"
};

const CATEGORY_COLORS = {
  technical: "bg-blue-100 text-blue-800",
  compliance: "bg-purple-100 text-purple-800",
  "soft-skills": "bg-pink-100 text-pink-800",
  leadership: "bg-indigo-100 text-indigo-800"
};

export default function Training() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"]
  });

  // Fetch user enrollments
  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"]
  });

  // Fetch resources
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"]
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return apiRequest(`/api/enroll/${courseId}`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
    }
  });

  // Filter courses
  const filteredCourses = (courses as Course[]).filter((course: Course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get enrollment status for a course
  const getEnrollmentStatus = (courseId: string) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  // Handle enrollment
  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎓 Centre de Formation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Développez vos compétences avec nos modules de formation interactifs
          </p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="my-learning">Mon Apprentissage</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
            <TabsTrigger value="certificates">Certificats</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* Filters */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher un cours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catégorie</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="technical">Technique</SelectItem>
                        <SelectItem value="compliance">Conformité</SelectItem>
                        <SelectItem value="soft-skills">Compétences douces</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Niveau</label>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les niveaux" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les niveaux</SelectItem>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: Course) => {
                const enrollment = getEnrollmentStatus(course.id);
                const isEnrolled = !!enrollment;
                
                return (
                  <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-primary/50" />
                      )}
                    </div>
                    
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        {course.isMandatory && (
                          <Badge variant="destructive" className="text-xs">
                            Obligatoire
                          </Badge>
                        )}
                      </div>
                      
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={CATEGORY_COLORS[course.category as keyof typeof CATEGORY_COLORS] || "bg-gray-100 text-gray-800"}>
                          {course.category}
                        </Badge>
                        <Badge className={DIFFICULTY_COLORS[course.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                          {course.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.authorName}
                        </div>
                      </div>
                      
                      {isEnrolled ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progression</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                          <Button 
                            className="w-full" 
                            variant={enrollment.status === "completed" ? "secondary" : "default"}
                          >
                            {enrollment.status === "completed" ? (
                              <>
                                <Award className="mr-2 h-4 w-4" />
                                Terminé
                              </>
                            ) : (
                              <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Continuer
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollMutation.isPending}
                          className="w-full"
                        >
                          {enrollMutation.isPending ? (
                            "Inscription..."
                          ) : (
                            <>
                              <BookOpen className="mr-2 h-4 w-4" />
                              S'inscrire
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCourses.length === 0 && (
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun cours trouvé</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Essayez de modifier vos critères de recherche ou de filtrage.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Learning Tab */}
          <TabsContent value="my-learning" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <CardTitle>Mes Formations en Cours</CardTitle>
                <CardDescription>
                  Suivez votre progression et continuez votre apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune formation en cours</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Explorez notre catalogue de cours pour commencer votre apprentissage.
                    </p>
                    <Button onClick={() => {
                      const tab = document.querySelector('[value="courses"]') as HTMLElement;
                      tab?.click();
                    }}>
                      Voir les Cours
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => {
                      const course = (courses as Course[]).find((c: Course) => c.id === enrollment.courseId);
                      if (!course) return null;
                      
                      return (
                        <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex-1">
                            <h4 className="font-semibold">{course.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-4 w-4" />
                                {course.duration} min
                              </div>
                              <Badge className={DIFFICULTY_COLORS[course.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                                {course.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {enrollment.progress}%
                            </div>
                            <Progress value={enrollment.progress} className="w-24 h-2" />
                          </div>
                          <Button size="sm">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Continuer
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <CardTitle>Bibliothèque de Ressources</CardTitle>
                <CardDescription>
                  Documentations, guides et ressources supplémentaires pour votre formation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource: Resource) => (
                    <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base group-hover:text-primary transition-colors">
                              {resource.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {resource.description}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {resource.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="h-4 w-4" />
                            {resource.rating}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {resource.downloadCount} téléchargements
                          </span>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {resources.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune ressource disponible</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Les ressources de formation seront bientôt disponibles.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <CardTitle>Mes Certificats</CardTitle>
                <CardDescription>
                  Vos accomplissements et certifications obtenues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun certificat encore</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Terminez vos cours pour obtenir vos premiers certificats !
                  </p>
                  <Button onClick={() => {
                    const tab = document.querySelector('[value="courses"]') as HTMLElement;
                    tab?.click();
                  }}>
                    Explorer les Cours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}