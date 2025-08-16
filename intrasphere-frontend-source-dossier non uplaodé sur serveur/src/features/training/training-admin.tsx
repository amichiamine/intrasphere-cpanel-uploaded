import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/core/lib/queryClient";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema, insertLessonSchema, insertResourceSchema } from "@shared/schema";
import type { Course, Lesson, Resource, User } from "@shared/schema";
import { BookOpen, Plus, Edit2, Trash2, Users, FileText, Award, Clock, Target, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";

export default function TrainingAdmin() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"]
  });

  const { data: lessons = [] } = useQuery({
    queryKey: selectedCourse ? ["/api/courses", selectedCourse.id, "lessons"] : [],
    enabled: !!selectedCourse
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["/api/resources"]
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"]
  });

  // Forms
  const courseForm = useForm({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "technical" as const,
      difficulty: "beginner" as const,
      duration: 60,
      isMandatory: false,
      isActive: true,
      authorName: "",
      thumbnailUrl: ""
    }
  });

  const lessonForm = useForm({
    resolver: zodResolver(insertLessonSchema.omit({ courseId: true })),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      duration: 30,
      orderIndex: 1,
      isActive: true
    }
  });

  const resourceForm = useForm({
    resolver: zodResolver(insertResourceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "document" as const,
      fileUrl: "",
      fileSize: 0,
      rating: 0,
      downloadCount: 0
    }
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/courses", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Cours créé avec succès!" });
      setCourseDialogOpen(false);
      courseForm.reset();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création du cours", variant: "destructive" });
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/lessons", "POST", { ...data, courseId: selectedCourse?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse?.id, "lessons"] });
      toast({ title: "Leçon créée avec succès!" });
      setLessonDialogOpen(false);
      lessonForm.reset();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création de la leçon", variant: "destructive" });
    }
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/resources", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Ressource créée avec succès!" });
      setResourceDialogOpen(false);
      resourceForm.reset();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création de la ressource", variant: "destructive" });
    }
  });

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
            🎓 Administration des Formations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Gérez les cours, leçons et ressources pédagogiques
          </p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="lessons">Leçons</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
          </TabsList>

          {/* Courses Management Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Gestion des Cours
                    </CardTitle>
                    <CardDescription>
                      Créez et modifiez les cours de formation
                    </CardDescription>
                  </div>
                  <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Cours
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Créer un nouveau cours</DialogTitle>
                        <DialogDescription>
                          Ajoutez un nouveau cours de formation au catalogue
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...courseForm}>
                        <form onSubmit={courseForm.handleSubmit((data) => createCourseMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={courseForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Titre</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Titre du cours" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={courseForm.control}
                              name="authorName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Formateur</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nom du formateur" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={courseForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Description du cours" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={courseForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Catégorie</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Catégorie" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="technical">Technique</SelectItem>
                                      <SelectItem value="compliance">Conformité</SelectItem>
                                      <SelectItem value="soft-skills">Compétences douces</SelectItem>
                                      <SelectItem value="leadership">Leadership</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={courseForm.control}
                              name="difficulty"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Niveau</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Niveau" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="beginner">Débutant</SelectItem>
                                      <SelectItem value="intermediate">Intermédiaire</SelectItem>
                                      <SelectItem value="advanced">Avancé</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={courseForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Durée (min)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Button type="button" variant="outline" onClick={() => setCourseDialogOpen(false)}>
                              Annuler
                            </Button>
                            <Button type="submit" disabled={createCourseMutation.isPending}>
                              {createCourseMutation.isPending ? "Création..." : "Créer le cours"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(courses as Course[]).map((course) => (
                    <Card key={course.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-green-500" />
                            <Button size="sm" variant="ghost">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{course.category}</Badge>
                          <Badge variant="secondary">{course.difficulty}</Badge>
                          {course.isMandatory && (
                            <Badge variant="destructive">Obligatoire</Badge>
                          )}
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
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCourse(course)}
                            className="flex-1"
                          >
                            Gérer les leçons
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons Management Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Gestion des Leçons
                      {selectedCourse && (
                        <Badge variant="outline" className="ml-2">
                          {selectedCourse.title}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedCourse 
                        ? `Gérez les leçons du cours "${selectedCourse.title}"`
                        : "Sélectionnez un cours dans l'onglet Cours pour gérer ses leçons"
                      }
                    </CardDescription>
                  </div>
                  {selectedCourse && (
                    <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Nouvelle Leçon
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Créer une nouvelle leçon</DialogTitle>
                          <DialogDescription>
                            Ajoutez une nouvelle leçon au cours "{selectedCourse.title}"
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...lessonForm}>
                          <form onSubmit={lessonForm.handleSubmit((data) => createLessonMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={lessonForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Titre</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Titre de la leçon" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={lessonForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Description de la leçon" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={lessonForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contenu</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Contenu détaillé de la leçon (HTML supporté)" 
                                      className="min-h-[120px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Vous pouvez utiliser du HTML pour formater le contenu
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={lessonForm.control}
                                name="duration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Durée (min)</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={lessonForm.control}
                                name="orderIndex"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ordre</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                                Annuler
                              </Button>
                              <Button type="submit" disabled={createLessonMutation.isPending}>
                                {createLessonMutation.isPending ? "Création..." : "Créer la leçon"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedCourse ? (
                  <div className="space-y-4">
                    {(lessons as Lesson[]).map((lesson) => (
                      <Card key={lesson.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">#{(lesson as any).order || 1}</Badge>
                              <h4 className="font-semibold">{lesson.title}</h4>
                              <Eye className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {lesson.duration} min
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {(lessons as Lesson[]).length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Aucune leçon</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Ce cours n'a pas encore de leçons. Créez la première !
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Sélectionnez un cours</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choisissez un cours dans l'onglet Cours pour gérer ses leçons.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Management Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Gestion des Ressources
                    </CardTitle>
                    <CardDescription>
                      Gérez la bibliothèque de ressources pédagogiques
                    </CardDescription>
                  </div>
                  <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Ressource
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle ressource</DialogTitle>
                        <DialogDescription>
                          Ajoutez une nouvelle ressource à la bibliothèque
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...resourceForm}>
                        <form onSubmit={resourceForm.handleSubmit((data) => createResourceMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={resourceForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Titre</FormLabel>
                                <FormControl>
                                  <Input placeholder="Titre de la ressource" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={resourceForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Description de la ressource" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={resourceForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Catégorie</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Catégorie" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="document">Document</SelectItem>
                                      <SelectItem value="video">Vidéo</SelectItem>
                                      <SelectItem value="presentation">Présentation</SelectItem>
                                      <SelectItem value="template">Modèle</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={resourceForm.control}
                              name="fileUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL du fichier</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Button type="button" variant="outline" onClick={() => setResourceDialogOpen(false)}>
                              Annuler
                            </Button>
                            <Button type="submit" disabled={createResourceMutation.isPending}>
                              {createResourceMutation.isPending ? "Création..." : "Créer la ressource"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(resources as Resource[]).map((resource) => (
                    <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-base">{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{resource.category}</Badge>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cours</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(courses as Course[]).length}</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(users as User[]).length}</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ressources</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(resources as Resource[]).length}</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificats</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}