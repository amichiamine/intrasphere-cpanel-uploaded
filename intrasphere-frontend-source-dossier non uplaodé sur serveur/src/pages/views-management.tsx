import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Input } from '@/core/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/core/components/ui/form';
import { Textarea } from '@/core/components/ui/textarea';
import { Checkbox } from '@/core/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout, Eye, Settings, Users, Plus, Edit, Trash2, Monitor } from 'lucide-react';
import { useAuth } from '@/core/hooks/useAuth';
import { userHasPermission } from '@/shared/utils/auth';
import { API_ROUTES } from '@/shared/constants/routes';
import { PERMISSIONS } from '@/shared/constants/permissions';

const viewConfigSchema = z.object({
  viewId: z.string().min(1, 'L\'ID de la vue est requis'),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  layout: z.enum(['grid', 'list', 'card', 'table']),
  isVisible: z.boolean().default(true),
  allowedRoles: z.array(z.string()).min(1, 'Au moins un rôle doit être sélectionné'),
  customSettings: z.record(z.any()).optional()
});

type ViewConfigFormData = z.infer<typeof viewConfigSchema>;

interface ViewConfig {
  id: string;
  viewId: string;
  title: string;
  description?: string;
  layout: 'grid' | 'list' | 'card' | 'table';
  isVisible: boolean;
  allowedRoles: string[];
  customSettings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const availableViews = [
  { id: 'dashboard', name: 'Tableau de Bord', description: 'Page d\'accueil principal' },
  { id: 'announcements', name: 'Annonces', description: 'Liste des annonces' },
  { id: 'documents', name: 'Documents', description: 'Bibliothèque de documents' },
  { id: 'events', name: 'Événements', description: 'Calendrier des événements' },
  { id: 'directory', name: 'Annuaire', description: 'Liste des employés' },
  { id: 'training', name: 'Formations', description: 'Système de formation' },
  { id: 'forum', name: 'Forum', description: 'Forum de discussion' }
];

const availableRoles = ['admin', 'moderator', 'employee', 'guest'];

export default function ViewsManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedView, setSelectedView] = useState<ViewConfig | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');

  const { data: viewConfigs, isLoading } = useQuery({
    queryKey: [API_ROUTES.VIEWS_CONFIG],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.VIEWS_CONFIG, { credentials: 'include' });
      if (!res.ok) {
        // Return empty array instead of throwing error to prevent crashes
        console.warn('Failed to fetch view configs:', res.status);
        return [];
      }
      const data = await res.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    }
  });

  const createConfigMutation = useMutation({
    mutationFn: (data: ViewConfigFormData) =>
      fetch(API_ROUTES.VIEWS_CONFIG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.VIEWS_CONFIG] });
      setIsConfigDialogOpen(false);
      form.reset();
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: (data: ViewConfigFormData & { id: string }) =>
      fetch(API_ROUTES.VIEWS_CONFIG_BY_ID(data.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.VIEWS_CONFIG] });
      setIsConfigDialogOpen(false);
      setSelectedView(null);
    }
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(API_ROUTES.VIEWS_CONFIG_BY_ID(id), {
        method: 'DELETE',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.VIEWS_CONFIG] });
    }
  });

  const form = useForm<ViewConfigFormData>({
    resolver: zodResolver(viewConfigSchema),
    defaultValues: {
      viewId: '',
      title: '',
      description: '',
      layout: 'grid',
      isVisible: true,
      allowedRoles: ['employee'],
      customSettings: {}
    }
  });

  const handleSubmit = (data: ViewConfigFormData) => {
    if (selectedView) {
      updateConfigMutation.mutate({ ...data, id: selectedView.id });
    } else {
      createConfigMutation.mutate(data);
    }
  };

  const handleEdit = (config: ViewConfig) => {
    setSelectedView(config);
    form.reset({
      viewId: config.viewId,
      title: config.title,
      description: config.description || '',
      layout: config.layout,
      isVisible: config.isVisible,
      allowedRoles: config.allowedRoles,
      customSettings: config.customSettings || {}
    });
    setIsConfigDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette configuration?')) {
      deleteConfigMutation.mutate(id);
    }
  };

  const getLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'grid': return '⊞';
      case 'list': return '☰';
      case 'card': return '⊡';
      case 'table': return '⊞';
      default: return '⊞';
    }
  };

  const canManageViews = userHasPermission(user as any, PERMISSIONS.MANAGE_SYSTEM_SETTINGS);

  if (!canManageViews) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès Refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour gérer les vues.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="views-management-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Vues</h1>
          <p className="text-gray-600 mt-2">Configurez l'affichage et les permissions des différentes vues</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedView(null);
            form.reset();
            setIsConfigDialogOpen(true);
          }}
          data-testid="button-create-view-config"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Configuration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration" data-testid="tab-configuration">Configuration</TabsTrigger>
          <TabsTrigger value="layout" data-testid="tab-layout">Mise en Page</TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              <div>Chargement des configurations...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(viewConfigs) ? viewConfigs.map((config: ViewConfig) => (
                    <Card key={config.id} data-testid={`card-view-config-${config.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{config.title}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                          </div>
                          <Badge variant={config.isVisible ? "default" : "secondary"}>
                            {config.isVisible ? 'Visible' : 'Masqué'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Layout className="w-4 h-4 mr-2" />
                            <span>Vue: {config.viewId}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Monitor className="w-4 h-4 mr-2" />
                            <span>Mise en page: {getLayoutIcon(config.layout)} {config.layout}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Rôles: {config.allowedRoles.join(', ')}</span>
                          </div>
                          <div className="flex justify-between mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedView(config);
                                setIsPreviewDialogOpen(true);
                              }}
                              data-testid={`button-preview-${config.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Aperçu
                            </Button>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(config)}
                                data-testid={`button-edit-${config.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(config.id)}
                                data-testid={`button-delete-${config.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : null}
                </div>

                {Array.isArray(viewConfigs) && viewConfigs.length === 0 && (
                  <div className="text-center py-12">
                    <Layout className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune configuration</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première configuration de vue.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Types de Mise en Page Disponibles</CardTitle>
                <CardDescription>Choisissez le type d'affichage pour chaque vue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">⊞</div>
                    <h4 className="font-medium">Grille</h4>
                    <p className="text-sm text-gray-600">Affichage en grille</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">☰</div>
                    <h4 className="font-medium">Liste</h4>
                    <p className="text-sm text-gray-600">Affichage en liste</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">⊡</div>
                    <h4 className="font-medium">Cartes</h4>
                    <p className="text-sm text-gray-600">Affichage en cartes</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">⊞</div>
                    <h4 className="font-medium">Tableau</h4>
                    <p className="text-sm text-gray-600">Affichage tabulaire</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid gap-4">
            {availableViews.map(view => {
              const config = viewConfigs?.find((c: ViewConfig) => c.viewId === view.id);
              return (
                <Card key={view.id} data-testid={`card-view-permissions-${view.id}`}>
                  <CardHeader>
                    <CardTitle>{view.name}</CardTitle>
                    <CardDescription>{view.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        {config ? (
                          <div className="flex space-x-2">
                            {config.allowedRoles.map((role: string) => (
                              <Badge key={role} variant="outline">{role}</Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary">Non configuré</Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (config) {
                            handleEdit(config);
                          } else {
                            form.reset({
                              viewId: view.id,
                              title: view.name,
                              description: view.description,
                              layout: 'grid',
                              isVisible: true,
                              allowedRoles: ['employee'],
                              customSettings: {}
                            });
                            setIsConfigDialogOpen(true);
                          }
                        }}
                        data-testid={`button-configure-${view.id}`}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {config ? 'Modifier' : 'Configurer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedView ? 'Modifier la Configuration' : 'Nouvelle Configuration de Vue'}
            </DialogTitle>
            <DialogDescription>
              Configurez l'affichage et les permissions pour cette vue.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="viewId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vue*</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full p-2 border rounded-md"
                        disabled={!!selectedView}
                        data-testid="select-view-id"
                      >
                        <option value="">Sélectionner une vue</option>
                        {availableViews.map(view => (
                          <option key={view.id} value={view.id}>
                            {view.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Titre de la vue" 
                        {...field} 
                        data-testid="input-view-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la vue" 
                        {...field} 
                        data-testid="input-view-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mise en page*</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full p-2 border rounded-md"
                        data-testid="select-view-layout"
                      >
                        <option value="grid">Grille</option>
                        <option value="list">Liste</option>
                        <option value="card">Cartes</option>
                        <option value="table">Tableau</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowedRoles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôles autorisés*</FormLabel>
                    <FormControl>
                      <div className="space-y-2" data-testid="checkboxes-allowed-roles">
                        {availableRoles.map(role => (
                          <label key={role} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value.includes(role)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, role]);
                                } else {
                                  field.onChange(field.value.filter((r: string) => r !== role));
                                }
                              }}
                              data-testid={`checkbox-role-${role}`}
                            />
                            <span className="capitalize">{role}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-view-visible"
                      />
                    </FormControl>
                    <FormLabel>Vue visible</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConfigDialogOpen(false)}
                  data-testid="button-cancel-config"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createConfigMutation.isPending || updateConfigMutation.isPending}
                  data-testid="button-save-config"
                >
                  {(createConfigMutation.isPending || updateConfigMutation.isPending) 
                    ? 'Enregistrement...' 
                    : selectedView ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Aperçu de la Configuration</DialogTitle>
            <DialogDescription>
              Prévisualisation de la configuration de vue
            </DialogDescription>
          </DialogHeader>
          
          {selectedView && (
            <div className="space-y-4" data-testid="view-preview">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-medium">{selectedView.title}</h3>
                <p className="text-sm text-gray-600">{selectedView.description}</p>
                <div className="mt-2 flex space-x-2">
                  <Badge variant="outline">Vue: {selectedView.viewId}</Badge>
                  <Badge variant="outline">Layout: {selectedView.layout}</Badge>
                  <Badge variant={selectedView.isVisible ? "default" : "secondary"}>
                    {selectedView.isVisible ? 'Visible' : 'Masqué'}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Rôles autorisés:</p>
                  <div className="flex space-x-1 mt-1">
                    {selectedView.allowedRoles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-2">Aperçu du layout: {selectedView.layout}</h4>
                <div className="text-center p-8 bg-gray-100 rounded">
                  <div className="text-4xl mb-2">{getLayoutIcon(selectedView.layout)}</div>
                  <p className="text-gray-600">Rendu de la vue en mode {selectedView.layout}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}