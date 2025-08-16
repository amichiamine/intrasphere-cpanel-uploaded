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
import { insertTrainingSchema } from "@shared/schema";
import type { Training, TrainingParticipant, User } from "@shared/schema";
import { BookOpen, Plus, Edit2, Trash2, Users, FileText, Award, Clock, Target, Eye, EyeOff, Upload, Calendar, MapPin, User as UserIcon } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";
import { Switch } from "@/core/components/ui/switch";

export default function Trainings() {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data
  const { data: trainings = [], isLoading: trainingsLoading } = useQuery({
    queryKey: ["/api/trainings"]
  });

  const { data: participants = [] } = useQuery({
    queryKey: selectedTraining ? ["/api/trainings", selectedTraining.id, "participants"] : [],
    enabled: !!selectedTraining
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"]
  });

  // Forms
  const trainingForm = useForm({
    resolver: zodResolver(insertTrainingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "technical" as const,
      difficulty: "beginner" as const,
      duration: 60,
      instructorName: "",
      startDate: undefined,
      endDate: undefined,
      location: "",
      maxParticipants: undefined,
      isMandatory: false,
      isActive: true,
      isVisible: true,
      thumbnailUrl: "",
      documentUrls: []
    }
  });

  // Mutations
  const createTrainingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create training");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      setTrainingDialogOpen(false);
      trainingForm.reset();
      toast({
        title: "Formation créée",
        description: "La formation a été créée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la formation.",
        variant: "destructive",
      });
    }
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/trainings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update training");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      setTrainingDialogOpen(false);
      setEditingTraining(null);
      trainingForm.reset();
      toast({
        title: "Formation modifiée",
        description: "La formation a été modifiée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la formation.",
        variant: "destructive",
      });
    }
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/trainings/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete training");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({
        title: "Formation supprimée",
        description: "La formation a été supprimée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la formation.",
        variant: "destructive",
      });
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const response = await fetch(`/api/trainings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle visibility");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({
        title: "Visibilité modifiée",
        description: "La visibilité de la formation a été modifiée.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la visibilité.",
        variant: "destructive",
      });
    }
  });

  const registerForTrainingMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      const response = await fetch(`/api/trainings/${trainingId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register for training");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      if (selectedTraining) {
        queryClient.invalidateQueries({ queryKey: ["/api/trainings", selectedTraining.id, "participants"] });
      }
      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant inscrit à cette formation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de s'inscrire à la formation.",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const openCreateDialog = () => {
    setEditingTraining(null);
    trainingForm.reset({
      title: "",
      description: "",
      category: "technical",
      difficulty: "beginner",
      duration: 60,
      instructorName: "",
      startDate: undefined,
      endDate: undefined,
      location: "",
      maxParticipants: undefined,
      isMandatory: false,
      isActive: true,
      isVisible: true,
      thumbnailUrl: "",
      documentUrls: []
    });
    setTrainingDialogOpen(true);
  };

  const openEditDialog = (training: Training) => {
    setEditingTraining(training);
    trainingForm.reset({
      title: training.title,
      description: training.description || "",
      category: training.category as "technical" | "management" | "safety" | "compliance" | "other",
      difficulty: (training.difficulty || "beginner") as "beginner" | "intermediate" | "advanced",
      duration: training.duration,
      instructorName: training.instructorName,
      startDate: undefined,
      endDate: undefined,
      location: training.location || "",
      maxParticipants: undefined,
      isMandatory: training.isMandatory || false,
      isActive: training.isActive || true,
      isVisible: training.isVisible ?? true,
      thumbnailUrl: training.thumbnailUrl || "",
      documentUrls: []
    });
    setTrainingDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingTraining) {
      updateTrainingMutation.mutate({ id: editingTraining.id, data });
    } else {
      createTrainingMutation.mutate(data);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      management: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      safety: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      compliance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  // Filter trainings based on visibility toggle
  const filteredTrainings = showHidden 
    ? (trainings as Training[]) 
    : (trainings as Training[]).filter((training: Training) => training.isVisible);

  if (trainingsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Formations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez et suivez les formations de l'entreprise
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-hidden"
              checked={showHidden}
              onCheckedChange={setShowHidden}
              data-testid="switch-show-hidden"
            />
            <Label htmlFor="show-hidden" className="text-sm">
              Afficher les formations masquées
            </Label>
          </div>
          <Button 
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="button-create-training"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Formation
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" data-testid="tab-list">
            <BookOpen className="h-4 w-4 mr-2" />
            Liste des Formations
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainings.map((training: Training) => (
              <Card 
                key={training.id} 
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => setSelectedTraining(training)}
                data-testid={`card-training-${training.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {training.title}
                        {!training.isVisible && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Masqué
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getCategoryColor(training.category)} data-testid={`badge-category-${training.category}`}>
                          {training.category}
                        </Badge>
                        <Badge className={getDifficultyColor(training.difficulty || 'beginner')} data-testid={`badge-difficulty-${training.difficulty}`}>
                          {training.difficulty}
                        </Badge>
                        {training.isMandatory && (
                          <Badge variant="destructive" data-testid="badge-mandatory">
                            Obligatoire
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibilityMutation.mutate({
                            id: training.id,
                            isVisible: !training.isVisible
                          });
                        }}
                        data-testid={`button-toggle-visibility-${training.id}`}
                      >
                        {training.isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(training);
                        }}
                        data-testid={`button-edit-${training.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
                            deleteTrainingMutation.mutate(training.id);
                          }
                        }}
                        data-testid={`button-delete-${training.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {training.description}
                  </CardDescription>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Formateur:</span>
                      <span className="text-gray-600 dark:text-gray-400">{training.instructorName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Durée:</span>
                      <span className="text-gray-600 dark:text-gray-400">{training.duration} minutes</span>
                    </div>
                    
                    {training.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Lieu:</span>
                        <span className="text-gray-600 dark:text-gray-400">{training.location}</span>
                      </div>
                    )}
                    
                    {training.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Date:</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(training.startDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Participants:</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {training.currentParticipants || 0}
                        {training.maxParticipants ? ` / ${training.maxParticipants}` : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        registerForTrainingMutation.mutate(training.id);
                      }}
                      data-testid={`button-register-${training.id}`}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      S'inscrire
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier des Formations</CardTitle>
              <CardDescription>
                Vue chronologique des formations planifiées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Calendrier en cours de développement...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Training Detail Dialog */}
      {selectedTraining && (
        <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTraining.title}</DialogTitle>
              <DialogDescription>
                Formation {selectedTraining.category} - Niveau {selectedTraining.difficulty}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informations générales</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {selectedTraining.description}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Formateur:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {selectedTraining.instructorName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Durée:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {selectedTraining.duration} minutes
                      </span>
                    </div>
                    {selectedTraining.location && (
                      <div>
                        <span className="font-medium">Lieu:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedTraining.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Participants ({(participants as TrainingParticipant[]).length})</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {(participants as TrainingParticipant[]).map((participant: TrainingParticipant) => {
                      const user = (users as User[]).find((u: User) => u.id === participant.userId);
                      return (
                        <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium">{user?.name || 'Utilisateur inconnu'}</div>
                              <div className="text-sm text-gray-500">{user?.department}</div>
                            </div>
                          </div>
                          <Badge variant={participant.status === 'completed' ? 'default' : 'secondary'}>
                            {participant.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {selectedTraining.documentUrls && selectedTraining.documentUrls.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTraining.documentUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm truncate">{url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit Training Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTraining ? "Modifier la Formation" : "Nouvelle Formation"}
            </DialogTitle>
            <DialogDescription>
              {editingTraining 
                ? "Modifiez les informations de la formation"
                : "Créez une nouvelle formation pour votre équipe"
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...trainingForm}>
            <form onSubmit={trainingForm.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={trainingForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Titre de la formation"
                          data-testid="input-training-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={trainingForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-training-category">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technique</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="safety">Sécurité</SelectItem>
                          <SelectItem value="compliance">Conformité</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={trainingForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-training-difficulty">
                            <SelectValue placeholder="Sélectionner un niveau" />
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
                  control={trainingForm.control}
                  name="instructorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formateur</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nom du formateur"
                          data-testid="input-instructor-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={trainingForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          placeholder="60"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-training-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={trainingForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Salle de réunion A"
                          data-testid="input-training-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={trainingForm.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre max de participants (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          placeholder="20"
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-max-participants"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={trainingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Description détaillée de la formation"
                        className="min-h-[100px]"
                        data-testid="textarea-training-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-6">
                <FormField
                  control={trainingForm.control}
                  name="isMandatory"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-mandatory"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Formation obligatoire
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={trainingForm.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-visible"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Formation visible
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setTrainingDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTrainingMutation.isPending || updateTrainingMutation.isPending}
                  data-testid="button-submit"
                >
                  {createTrainingMutation.isPending || updateTrainingMutation.isPending 
                    ? "En cours..." 
                    : editingTraining ? "Modifier" : "Créer"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}