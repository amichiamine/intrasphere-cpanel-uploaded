import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { AlertTriangle, Plus, Clock, CheckCircle2, User as UserIcon, Building } from "lucide-react";
import { insertComplaintSchema, type Complaint, type User } from "@shared/schema";
import { apiRequest } from "@/core/lib/queryClient";
import { useToast } from "@/core/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800"
};

const priorityLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée", 
  urgent: "Urgente"
};

const statusLabels = {
  open: "Ouverte",
  in_progress: "En cours",
  resolved: "Résolue",
  closed: "Fermée"
};

const categoryLabels = {
  hr: "Ressources Humaines",
  it: "Informatique",
  facilities: "Locaux/Matériel",
  other: "Autre"
};

export default function Complaints() {
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // For demo purposes, using user-1 as current user
  const currentUserId = "user-1";

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      submitterId: currentUserId,
      assignedToId: "",
      title: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  const createComplaintMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/complaints`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      form.reset();
      setOpenCreate(false);
      toast({
        title: "Réclamation soumise",
        description: "Votre réclamation a été envoyée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la réclamation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createComplaintMutation.mutate(data);
  };

  const getSubmitterName = (complaint: Complaint) => {
    const submitter = users.find(user => user.id === complaint.submitterId);
    return submitter?.name || "Utilisateur inconnu";
  };

  const getAssigneeName = (complaint: Complaint) => {
    if (!complaint.assignedToId) return "Non assignée"; 
    const assignee = users.find(user => user.id === complaint.assignedToId);
    return assignee?.name || "Utilisateur inconnu";
  };

  const adminUsers = users.filter(user => user.role === "admin" || user.role === "moderator");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Réclamations
            </h1>
            <p className="text-gray-600 mt-2">
              Soumettez et suivez vos réclamations
            </p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Réclamation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle Réclamation</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Résumé de votre réclamation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hr">Ressources Humaines</SelectItem>
                              <SelectItem value="it">Informatique</SelectItem>
                              <SelectItem value="facilities">Locaux/Matériel</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priorité</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Faible</SelectItem>
                              <SelectItem value="medium">Moyenne</SelectItem>
                              <SelectItem value="high">Élevée</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigner à (optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un administrateur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Auto-assignation</SelectItem>
                            {adminUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} - {user.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description détaillée</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez votre réclamation en détail..." 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createComplaintMutation.isPending}
                      className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    >
                      {createComplaintMutation.isPending ? "Soumission..." : "Soumettre"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints List */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Liste des réclamations
                </h2>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Chargement...</div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucune réclamation</p>
                    <p className="text-sm">Créez votre première réclamation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`p-4 rounded-xl border border-white/20 hover:bg-white/5 transition-all cursor-pointer ${
                          selectedComplaint?.id === complaint.id ? "ring-2 ring-red-500/50 bg-red-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {complaint.title}
                          </h3>
                          <div className="flex space-x-2">
                            <Badge className={priorityColors[complaint.priority as keyof typeof priorityColors]}>
                              {priorityLabels[complaint.priority as keyof typeof priorityLabels]}
                            </Badge>
                            <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                              {statusLabels[complaint.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <UserIcon className="w-3 h-3 mr-1" />
                              {getSubmitterName(complaint)}
                            </span>
                            <span className="flex items-center">
                              <Building className="w-3 h-3 mr-1" />
                              {categoryLabels[complaint.category as keyof typeof categoryLabels]}
                            </span>
                          </div>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {complaint.createdAt ? formatDistanceToNow(new Date(complaint.createdAt), { 
                              addSuffix: true, 
                              locale: fr 
                            }) : 'Date inconnue'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Complaint Detail */}
          <div className="lg:col-span-1">
            <GlassCard className="h-[600px]">
              {selectedComplaint ? (
                <div className="p-6 h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{selectedComplaint.title}</h3>
                    <div className="flex flex-col space-y-2 mb-4">
                      <div className="flex space-x-2">
                        <Badge className={priorityColors[selectedComplaint.priority as keyof typeof priorityColors]}>
                          {priorityLabels[selectedComplaint.priority as keyof typeof priorityLabels]}
                        </Badge>
                        <Badge className={statusColors[selectedComplaint.status as keyof typeof statusColors]}>
                          {statusLabels[selectedComplaint.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {categoryLabels[selectedComplaint.category as keyof typeof categoryLabels]}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {selectedComplaint.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Soumis par:</span>
                        <p className="text-gray-600">{getSubmitterName(selectedComplaint)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Assigné à:</span>
                        <p className="text-gray-600">{getAssigneeName(selectedComplaint)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Créée le:</span>
                        <p className="text-gray-600">
                          {selectedComplaint.createdAt ? formatDistanceToNow(new Date(selectedComplaint.createdAt), { 
                            addSuffix: true, 
                            locale: fr 
                          }) : 'Date inconnue'}
                        </p>
                      </div>
                      {selectedComplaint.updatedAt !== selectedComplaint.createdAt && (
                        <div>
                          <span className="font-medium text-gray-700">Mise à jour:</span>
                          <p className="text-gray-600">
                            {selectedComplaint.updatedAt ? formatDistanceToNow(new Date(selectedComplaint.updatedAt), { 
                              addSuffix: true, 
                              locale: fr 
                            }) : 'Date inconnue'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Sélectionnez une réclamation</p>
                    <p className="text-sm">Cliquez sur une réclamation pour voir les détails</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}