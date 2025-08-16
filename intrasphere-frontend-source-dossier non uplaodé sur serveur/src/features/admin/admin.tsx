import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { SimpleSelect } from "@/core/components/ui/simple-select";
import { SimpleModal } from "@/core/components/ui/simple-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Settings, Shield, Users, UserPlus, Trash2, CheckCircle2, XCircle, FileText, Plus, Edit, Eye, Image, Upload } from "lucide-react";
import { ImagePicker } from "@/core/components/ui/image-picker";
import { IconPicker } from "@/core/components/ui/icon-picker";
import { FileUploader } from "@/core/components/ui/file-uploader";
import { Switch } from "@/core/components/ui/switch";
import { insertPermissionSchema, insertDocumentSchema, insertEmployeeCategorySchema, type User, type Permission, type Document, type EmployeeCategory, type SystemSettings } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/core/lib/queryClient";
import { useToast } from "@/core/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const permissionLabels = {
  manage_announcements: "Gérer les annonces",
  manage_documents: "Gérer les documents", 
  manage_events: "Gérer les événements",
  manage_users: "Gérer les utilisateurs",
  validate_topics: "Valider les sujets forum",
  validate_posts: "Valider les posts forum",
  manage_employee_categories: "Gérer catégories employés"
};

const roleLabels = {
  admin: "Administrateur",
  moderator: "Modérateur",
  employee: "Employé"
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  moderator: "bg-purple-100 text-purple-800",
  employee: "bg-blue-100 text-blue-800"
};

const categoryLabels = {
  regulation: "Règlement",
  policy: "Politique",
  procedure: "Procédure",
  guide: "Guide"
};

const categoryColors = {
  regulation: "bg-red-100 text-red-800",
  policy: "bg-blue-100 text-blue-800", 
  procedure: "bg-green-100 text-green-800",
  guide: "bg-purple-100 text-purple-800"
};

export default function Admin() {
  const [openPermission, setOpenPermission] = useState(false);
  const [openDocument, setOpenDocument] = useState(false);
  const [openEmployeeCategory, setOpenEmployeeCategory] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editingEmployeeCategory, setEditingEmployeeCategory] = useState<EmployeeCategory | null>(null);
  const [selectedDocumentImage, setSelectedDocumentImage] = useState<string>("");
  const [selectedDocumentIcon, setSelectedDocumentIcon] = useState<string>("📄");
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<string>("");
  const [documentFileName, setDocumentFileName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, using user-1 as current user (admin)
  const currentUserId = "user-1";

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: allPermissions = [] as Permission[] } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: employeeCategories = [], isLoading: empCategoriesLoading } = useQuery<EmployeeCategory[]>({
    queryKey: ["/api/employee-categories"],
  });

  const { data: systemSettings } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertPermissionSchema),
    defaultValues: {
      userId: "",
      grantedBy: currentUserId,
      permission: "",
    },
  });

  const documentForm = useForm({
    resolver: zodResolver(insertDocumentSchema.extend({
      hasMultimedia: z.boolean().optional(),
      isPublic: z.boolean().optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
      category: "regulation",
      fileName: "",
      fileUrl: "",
      version: "1.0",
      hasMultimedia: false,
      isPublic: false,
    },
  });

  const employeeCategoryForm = useForm({
    resolver: zodResolver(insertEmployeeCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#10B981",
      permissions: [],
      isActive: true,
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/permissions`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      form.reset();
      setOpenPermission(false);
      toast({
        title: "Permission accordée",
        description: "La permission a été accordée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'accorder la permission",
        variant: "destructive",
      });
    },
  });

  const revokePermissionMutation = useMutation({
    mutationFn: async (permissionId: string) => {
      return await apiRequest(`/api/permissions/${permissionId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Permission révoquée",
        description: "La permission a été révoquée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer la permission",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest(`/api/users/${userId}`, "PATCH", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle",
        variant: "destructive",
      });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/documents`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      documentForm.reset();
      setOpenDocument(false);
      setEditingDocument(null);
      toast({
        title: "Document créé",
        description: "Le document a été ajouté avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le document",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/documents/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      documentForm.reset();
      setOpenDocument(false);
      setEditingDocument(null);
      toast({
        title: "Document mis à jour",
        description: "Le document a été modifié avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le document",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest(`/api/documents/${documentId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    },
  });

  const createEmployeeCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/employee-categories`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-categories"] });
      employeeCategoryForm.reset();
      setOpenEmployeeCategory(false);
      setEditingEmployeeCategory(null);
      toast({
        title: "Catégorie créée",
        description: "La catégorie d'employé a été créée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie d'employé",
        variant: "destructive",
      });
    },
  });

  const updateEmployeeCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/employee-categories/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-categories"] });
      employeeCategoryForm.reset();
      setOpenEmployeeCategory(false);
      setEditingEmployeeCategory(null);
      toast({
        title: "Catégorie mise à jour",
        description: "La catégorie d'employé a été modifiée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la catégorie d'employé",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await apiRequest(`/api/employee-categories/${categoryId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-categories"] });
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie d'employé a été supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie d'employé",
        variant: "destructive",
      });
    },
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/system-settings`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres système ont été modifiés avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les paramètres système",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createPermissionMutation.mutate(data);
  };

  const onDocumentSubmit = (data: any) => {
    const enrichedData = {
      ...data,
      fileUrl: selectedDocumentFile || data.fileUrl,
      fileName: documentFileName || data.fileName,
    };
    
    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, data: enrichedData });
    } else {
      createDocumentMutation.mutate(enrichedData);
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setSelectedDocumentFile(document.fileUrl);
    setDocumentFileName(document.fileName);
    setSelectedDocumentImage("");
    setSelectedDocumentIcon("📄");
    documentForm.reset({
      title: document.title,
      description: document.description || "",
      category: document.category,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      version: document.version || "1.0",
      hasMultimedia: false,
      isPublic: false,
    });
    setOpenDocument(true);
  };

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setSelectedDocumentFile("");
    setDocumentFileName("");
    setSelectedDocumentImage("");
    setSelectedDocumentIcon("📄");
    documentForm.reset({
      title: "",
      description: "",
      category: "regulation",
      fileName: "",
      fileUrl: "",
      version: "1.0",
      hasMultimedia: false,
      isPublic: false,
    });
    setOpenDocument(true);
  };

  const getUserPermissions = (userId: string) => {
    return allPermissions.filter(perm => perm.userId === userId);
  };

  const employeeUsers = users.filter(user => user.role === "employee");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{
              background: `linear-gradient(to right, var(--color-primary, #8B5CF6), var(--color-secondary, #A78BFA))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Administration
            </h1>
            <p className="text-gray-600 mt-2">
              Gestion des utilisateurs, permissions et contenu
            </p>
          </div>
        </div>

        {/* Tabs for different admin sections */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Rôles</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Catégories</span>
            </TabsTrigger>
            <TabsTrigger value="forum-settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Forum</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Gestion des Utilisateurs</h2>
              <div className="space-y-4">
                {usersLoading ? (
                  <div>Chargement...</div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name || user.username}</p>
                          <p className="text-sm text-gray-600">{user.employeeId} - {user.department}</p>
                          <p className="text-xs text-gray-500">{user.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                        <SimpleSelect
                          options={[
                            { value: "employee", label: "Employé" },
                            { value: "moderator", label: "Modérateur" },
                            { value: "admin", label: "Admin" }
                          ]}
                          value={user.role}
                          onValueChange={(newRole) => updateUserRoleMutation.mutate({ userId: user.id, role: newRole })}
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* Roles Configuration Tab */}
          <TabsContent value="roles" className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Configuration des Rôles</h2>
              <p className="text-gray-600 mb-4">
                Configurez les rôles disponibles dans votre organisation. Chaque rôle détermine les permissions et l'accès des utilisateurs.
              </p>
              
              {/* Explication détaillée des permissions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">📋 Guide Détaillé des Permissions</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border-l-4 border-green-400">
                        <strong className="text-green-700">📢 Publier des annonces</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Rédiger les actualités de l'entreprise<br/>
                          • Publier les événements et formations<br/>
                          • Modifier/supprimer ses propres annonces<br/>
                          • Planifier la publication d'annonces
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                        <strong className="text-blue-700">📁 Gérer les documents</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Ajouter règlements et procédures<br/>
                          • Modifier les documents existants<br/>
                          • Organiser par catégories<br/>
                          • Contrôler la visibilité des documents
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                        <strong className="text-orange-700">🛠️ Modérer les réclamations</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Voir toutes les réclamations employés<br/>
                          • Répondre et traiter les demandes<br/>
                          • Changer le statut (en cours, résolu)<br/>
                          • Assigner à d'autres modérateurs
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border-l-4 border-purple-400">
                        <strong className="text-purple-700">💬 Messages internes</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Envoyer des messages privés<br/>
                          • Créer des discussions de groupe<br/>
                          • Partager des fichiers entre collègues<br/>
                          • Historique complet des conversations
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-gray-400">
                        <strong className="text-gray-700">👁️ Consulter les informations</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Voir toutes les annonces publiées<br/>
                          • Accéder aux documents autorisés<br/>
                          • Consulter l'annuaire des employés<br/>
                          • Voir l'historique des modifications
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-indigo-400">
                        <strong className="text-indigo-700">⬇️ Télécharger des documents</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Sauvegarder les PDF sur ordinateur<br/>
                          • Export des règlements en local<br/>
                          • Impression des procédures<br/>
                          • Accès hors ligne aux documents
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border-l-4 border-teal-400">
                        <strong className="text-teal-700">👥 Accès à l'annuaire</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          • Consulter la liste des employés<br/>
                          • Voir les coordonnées professionnelles<br/>
                          • Rechercher par service/département<br/>
                          • Exporter les contacts autorisés
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Admin Role */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-red-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-red-800">Administrateur</h3>
                    <Badge className="bg-red-100 text-red-800">SYSTÈME</Badge>
                  </div>
                  <p className="text-sm text-red-700 mb-3">
                    Accès complet au système. Peut gérer tous les utilisateurs, permissions, contenu et paramètres.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Nom d'affichage</label>
                      <Input 
                        value="Administrateur" 
                        disabled 
                        className="bg-white/50 border-red-200" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Permissions</label>
                      <Input 
                        value="Toutes les permissions système" 
                        disabled 
                        className="bg-white/50 border-red-200" 
                      />
                    </div>
                  </div>
                </div>

                {/* Moderator Role */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-purple-800">Modérateur</h3>
                    <Badge className="bg-purple-100 text-purple-800">CONFIGURABLE</Badge>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    Peut publier du contenu, gérer les documents et modérer certaines sections. Niveau intermédiaire.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Nom d'affichage</label>
                      <Input 
                        defaultValue="Modérateur" 
                        placeholder="Ex: Superviseur, Manager..." 
                        className="border-purple-200" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Permissions accordées</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">📢 Publier et modifier des annonces</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">📁 Gérer les documents et règlements</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">🛠️ Modérer les réclamations</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">💬 Accès aux messages internes</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">👁️ Consulter toutes les informations</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">⬇️ Télécharger tous les documents</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">👥 Accès complet à l'annuaire</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Role */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-800">Employé</h3>
                    <Badge className="bg-blue-100 text-blue-800">CONFIGURABLE</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Utilisateur standard qui consulte les informations et peut faire des demandes. Accès de base.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Nom d'affichage</label>
                      <Input 
                        defaultValue="Employé" 
                        placeholder="Ex: Collaborateur, Agent..." 
                        className="border-blue-200" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Permissions accordées</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">👁️ Consulter les annonces et documents</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">📝 Soumettre des réclamations</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">💬 Envoyer des messages internes</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">⬇️ Télécharger des documents</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">👥 Accéder à l'annuaire employés</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">🔔 Recevoir les notifications</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restrictions et niveaux d'accès */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">⚠️ Niveaux de Restriction</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border-l-4 border-green-400">
                      <strong className="text-green-700">🟢 Accès Libre</strong>
                      <p className="text-gray-600 mt-1">Peut utiliser sans limitation (ex: consulter, télécharger)</p>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                      <strong className="text-orange-700">🟡 Accès Contrôlé</strong>
                      <p className="text-gray-600 mt-1">Nécessite validation ou permission spéciale (ex: publier)</p>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-red-400">
                      <strong className="text-red-700">🔴 Accès Interdit</strong>
                      <p className="text-gray-600 mt-1">Fonction complètement bloquée pour ce rôle</p>
                    </div>
                  </div>
                </div>

                {/* Add Custom Role */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Button 
                    variant="outline" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un rôle personnalisé
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Créez des rôles spécifiques à votre organisation (ex: Responsable RH, Chef d'équipe, Stagiaire)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button variant="outline">
                  Annuler
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                  Enregistrer les modifications
                </Button>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gestion des Permissions</h2>
              <Button 
                onClick={() => setOpenPermission(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Déléguer Permission
              </Button>
            </div>

        {/* Permission Modal */}
        <SimpleModal 
          open={openPermission} 
          onOpenChange={setOpenPermission}
          title="Déléguer une Permission"
          description="Attribuez des permissions spécifiques à un employé pour la gestion de contenu."
        >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Utilisateur</FormLabel>
                            <FormControl>
                              <SimpleSelect
                                options={employeeUsers.map((user) => ({
                                  value: user.id,
                                  label: `${user.name} (${user.employeeId})`
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Sélectionner un employé"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="permission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permission</FormLabel>
                            <FormControl>
                              <SimpleSelect
                                options={[
                                  { value: "manage_announcements", label: "Gérer les annonces" },
                                  { value: "manage_documents", label: "Gérer les documents" },
                                  { value: "manage_events", label: "Gérer les événements" },
                                  { value: "manage_users", label: "Gérer les utilisateurs" }
                                ]}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Sélectionner"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpenPermission(false)}>
                          Annuler
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPermissionMutation.isPending}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                        >
                          {createPermissionMutation.isPending ? "Délégation..." : "Déléguer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
        </SimpleModal>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Permissions Actuelles</h3>
              <div className="space-y-4">
                {allPermissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune permission déléguée</p>
                ) : (
                  allPermissions.map((permission) => {
                    const user = users.find(u => u.id === permission.userId);
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className="bg-indigo-100 text-indigo-800">
                              {permissionLabels[permission.permission as keyof typeof permissionLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">
                              {user?.name || "Utilisateur inconnu"} ({user?.employeeId})
                            </span>
                            <span className="text-xs text-gray-500">
                              {permission.createdAt ? formatDistanceToNow(new Date(permission.createdAt), { 
                                addSuffix: true, 
                                locale: fr 
                              }) : 'Date inconnue'}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revokePermissionMutation.mutate(permission.id)}
                          disabled={revokePermissionMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gestion des Documents</h2>
              <Button onClick={handleCreateDocument} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Document
              </Button>
            </div>
            
            <GlassCard className="p-6">
              <div className="space-y-4">
                {documentsLoading ? (
                  <div>Chargement...</div>
                ) : (
                  documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{document.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={categoryColors[document.category as keyof typeof categoryColors]}>
                              {categoryLabels[document.category as keyof typeof categoryLabels]}
                            </Badge>
                            <span className="text-xs text-gray-500">v{document.version}</span>
                          </div>
                          {document.description && (
                            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditDocument(document)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDocumentMutation.mutate(document.id)}
                          disabled={deleteDocumentMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* Employee Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Catégories d'Employés</h2>
              <Button 
                onClick={() => {
                  setEditingEmployeeCategory(null);
                  employeeCategoryForm.reset();
                  setOpenEmployeeCategory(true);
                }} 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                data-testid="button-create-employee-category"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Catégorie
              </Button>
            </div>
            
            <GlassCard className="p-6">
              <div className="space-y-4">
                {empCategoriesLoading ? (
                  <div>Chargement...</div>
                ) : (
                  employeeCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {category.permissions && category.permissions.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {category.permissions.length} permission(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingEmployeeCategory(category);
                            employeeCategoryForm.reset({
                              name: category.name,
                              description: category.description || "",
                              color: category.color,
                              permissions: category.permissions || [],
                              isActive: category.isActive,
                            });
                            setOpenEmployeeCategory(true);
                          }}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteEmployeeCategoryMutation.mutate(category.id)}
                          disabled={deleteEmployeeCategoryMutation.isPending}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* Forum Settings Tab */}
          <TabsContent value="forum-settings" className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Paramètres du Forum</h2>
              
              <div className="space-y-6">
                {/* Forum Visibility */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Visibilité du Forum</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Activer le Forum</h4>
                      <p className="text-sm text-gray-600">Permet aux employés d'accéder et d'utiliser le forum</p>
                    </div>
                    <Switch
                      checked={systemSettings?.forumEnabled || false}
                      onCheckedChange={(checked) => 
                        updateSystemSettingsMutation.mutate({ forumEnabled: checked })
                      }
                      data-testid="switch-forum-enabled"
                    />
                  </div>
                </div>

                {/* Topic/Post Validation Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Paramètres de Validation</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Validation des Sujets</h4>
                        <p className="text-sm text-gray-600">Les nouveaux sujets doivent être approuvés par un modérateur</p>
                      </div>
                      <Switch
                        checked={systemSettings?.requireTopicApproval || false}
                        onCheckedChange={(checked) => 
                          updateSystemSettingsMutation.mutate({ requireTopicApproval: checked })
                        }
                        data-testid="switch-topic-approval"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Validation des Messages</h4>
                        <p className="text-sm text-gray-600">Les nouveaux messages doivent être approuvés par un modérateur</p>
                      </div>
                      <Switch
                        checked={systemSettings?.requirePostApproval || false}
                        onCheckedChange={(checked) => 
                          updateSystemSettingsMutation.mutate({ requirePostApproval: checked })
                        }
                        data-testid="switch-post-approval"
                      />
                    </div>
                  </div>
                </div>

                {/* Permission Management for Forum */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Permissions Forum</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-3">
                      Gérez les permissions spécifiques au forum dans l'onglet "Permissions" :
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                      <li>• <strong>validate_topics</strong> : Valider les sujets du forum</li>
                      <li>• <strong>validate_posts</strong> : Valider les messages du forum</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Employee Category Creation/Edit Modal */}
        <SimpleModal 
          open={openEmployeeCategory} 
          onOpenChange={setOpenEmployeeCategory}
          title={editingEmployeeCategory ? "Modifier la Catégorie" : "Nouvelle Catégorie d'Employé"}
          description={editingEmployeeCategory 
            ? "Modifiez les informations de la catégorie d'employé." 
            : "Créez une nouvelle catégorie d'employé avec des permissions spécifiques."
          }
        >
          <Form {...employeeCategoryForm}>
            <form onSubmit={employeeCategoryForm.handleSubmit((data) => {
              if (editingEmployeeCategory) {
                updateEmployeeCategoryMutation.mutate({ id: editingEmployeeCategory.id, data });
              } else {
                createEmployeeCategoryMutation.mutate(data);
              }
            })} className="space-y-4">
              <FormField
                control={employeeCategoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la Catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Managers, Techniciens..." {...field} data-testid="input-category-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={employeeCategoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la catégorie..."
                        rows={2}
                        {...field}
                        data-testid="input-category-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={employeeCategoryForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} className="h-10 w-20" data-testid="input-category-color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={employeeCategoryForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Catégorie Active</FormLabel>
                      <p className="text-sm text-gray-600">La catégorie est disponible pour les employés</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-category-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenEmployeeCategory(false)}
                  data-testid="button-cancel-category"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEmployeeCategoryMutation.isPending || updateEmployeeCategoryMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  data-testid="button-save-category"
                >
                  {editingEmployeeCategory ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </SimpleModal>

        {/* Document Creation/Edit Modal */}
        <SimpleModal 
          open={openDocument} 
          onOpenChange={setOpenDocument}
          title={editingDocument ? "Modifier le Document" : "Nouveau Document"}
          description={editingDocument 
            ? "Modifiez les informations du document et ajoutez du contenu multimédia." 
            : "Créez un nouveau document avec du contenu multimédia pour votre organisation."
          }
        >
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={documentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du Document</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du document" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={documentForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <FormControl>
                          <SimpleSelect
                            options={[
                              { value: "regulation", label: "Règlement" },
                              { value: "policy", label: "Politique" },
                              { value: "procedure", label: "Procédure" },
                              { value: "guide", label: "Guide" }
                            ]}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Sélectionner"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={documentForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description du document..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={documentForm.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icône du Document</label>
                    <IconPicker
                      selectedIcon={selectedDocumentIcon}
                      onIconSelect={setSelectedDocumentIcon}
                    />
                  </div>
                </div>

                {/* Multimedia Content Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Image className="w-5 h-5 mr-2" />
                      Contenu Multimédia
                    </h3>
                    <FormField
                      control={documentForm.control}
                      name="hasMultimedia"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Activer multimédia</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {documentForm.watch("hasMultimedia") && (
                    <div className="space-y-4">
                      {/* Image Selection */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Image de couverture</label>
                        <ImagePicker
                          selectedImage={selectedDocumentImage}
                          onImageSelect={setSelectedDocumentImage}
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Fichier Principal</label>
                        <FileUploader
                          contentType="document"
                          selectedFile={selectedDocumentFile}
                          onFileSelect={(fileUrl: string, fileName?: string) => {
                            setSelectedDocumentFile(fileUrl);
                            if (fileName) setDocumentFileName(fileName);
                          }}
                        />
                      </div>

                      {/* Alternative: Manual URL Entry */}
                      <FormField
                        control={documentForm.control}
                        name="fileUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ou URL du Fichier</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/document.pdf" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={documentForm.control}
                        name="fileName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'affichage du fichier</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="document.pdf" 
                                value={documentFileName || field.value}
                                onChange={(e) => {
                                  setDocumentFileName(e.target.value);
                                  field.onChange(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Publishing Options */}
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Options de Publication
                  </h3>
                  
                  <FormField
                    control={documentForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Document Public</FormLabel>
                          <p className="text-sm text-gray-600">Visible par tous les employés</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenDocument(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {editingDocument ? "Modifier" : "Créer"}
                  </Button>
                </div>
            </form>
          </Form>
        </SimpleModal>
      </div>
    </MainLayout>
  );
}
