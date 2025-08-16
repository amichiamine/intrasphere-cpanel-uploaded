import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { Textarea } from "@/core/components/ui/textarea";
import { Label } from "@/core/components/ui/label";
import { Switch } from "@/core/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/core/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { 
  Archive, Image, Video, FileText, Music, Search, Filter, Upload, 
  Eye, Download, Edit3, Trash2, Grid, List, Plus, Settings, Palette, 
  Layout, Star, Share2, Play, Clock, Users, TrendingUp, Heart,
  Bookmark, MoreVertical, ExternalLink, Copy
} from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";
import { apiRequest, queryClient } from "@/core/lib/queryClient";
import { Link } from "wouter";

// Importer le type Content du schéma
import type { Content } from "@shared/schema";
type ContentItem = Content;

interface ContentCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isVisible: boolean;
  displayOrder: number;
}

interface ContentSettings {
  viewMode: 'grid' | 'list';
  itemsPerPage: number;
  showRatings: boolean;
  showViews: boolean;
  enableComments: boolean;
  allowDownloads: boolean;
  featuredSection: boolean;
  categoriesVisible: string[];
  sortBy: 'date' | 'popularity' | 'rating' | 'title';
  theme: 'default' | 'minimal' | 'cards' | 'magazine';
  categories: ContentCategory[];
}

// Données d'exemple pour la démonstration
const sampleContent: ContentItem[] = [
  {
    id: "content-1",
    title: "Guide d'intégration nouveaux employés",
    type: "video",
    category: "Formation",
    description: "Vidéo d'accueil complète pour faciliter l'intégration des nouveaux collaborateurs dans l'entreprise.",
    thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    fileUrl: "/content/integration-guide.mp4",
    duration: "12 min",
    views: 245,
    rating: 4.8,
    isPopular: true,
    isFeatured: true,
    tags: ["formation", "intégration", "nouveaux employés"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "content-2",
    title: "Présentation des nouveaux bureaux",
    type: "image",
    category: "Actualités",
    description: "Galerie photos complète des nouveaux espaces de travail aménagés avec les dernières technologies.",
    thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    fileUrl: "/content/bureaux-galerie.jpg",
    views: 156,
    rating: 4.5,
    isPopular: false,
    isFeatured: false,
    tags: ["bureaux", "aménagement", "photos"],
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z"
  },
  {
    id: "content-3",
    title: "Formation cybersécurité avancée",
    type: "video",
    category: "Formation",
    description: "Module de formation obligatoire sur les bonnes pratiques en sécurité informatique et protection des données.",
    thumbnailUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    fileUrl: "/content/cybersecurity-training.mp4",
    duration: "25 min",
    views: 312,
    rating: 4.9,
    isPopular: true,
    isFeatured: true,
    tags: ["cybersécurité", "formation", "obligatoire"],
    createdAt: "2024-01-08T09:15:00Z",
    updatedAt: "2024-01-08T09:15:00Z"
  },
  {
    id: "content-4",
    title: "Rapport annuel 2023",
    type: "document",
    category: "Corporate",
    description: "Bilan complet de l'année 2023 avec analyses détaillées et perspectives pour 2024.",
    thumbnailUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    fileUrl: "/content/rapport-annuel-2023.pdf",
    views: 89,
    rating: 4.2,
    isPopular: false,
    isFeatured: false,
    tags: ["rapport", "2023", "bilan"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

const defaultCategories: ContentCategory[] = [
  {
    id: 'formation',
    name: 'Formation',
    color: '#3B82F6',
    icon: '🎓',
    description: 'Contenus de formation et développement des compétences',
    isVisible: true,
    displayOrder: 1
  },
  {
    id: 'actualites',
    name: 'Actualités',
    color: '#10B981',
    icon: '📰',
    description: 'Actualités et informations de l\'entreprise',
    isVisible: true,
    displayOrder: 2
  },
  {
    id: 'corporate',
    name: 'Corporate',
    color: '#8B5CF6',
    icon: '🏢',
    description: 'Documents et communications corporate',
    isVisible: true,
    displayOrder: 3
  },
  {
    id: 'social',
    name: 'Social',
    color: '#F59E0B',
    icon: '🎉',
    description: 'Événements sociaux et team building',
    isVisible: true,
    displayOrder: 4
  },
  {
    id: 'ressources',
    name: 'Ressources',
    color: '#EF4444',
    icon: '📚',
    description: 'Ressources et outils de travail',
    isVisible: false,
    displayOrder: 5
  },
  {
    id: 'projets',
    name: 'Projets',
    color: '#06B6D4',
    icon: '🚀',
    description: 'Documentation et présentation de projets',
    isVisible: false,
    displayOrder: 6
  }
];

const defaultSettings: ContentSettings = {
  viewMode: 'grid',
  itemsPerPage: 12,
  showRatings: true,
  showViews: true,
  enableComments: true,
  allowDownloads: true,
  featuredSection: true,
  categoriesVisible: ['Formation', 'Actualités', 'Corporate', 'Social'],
  sortBy: 'date',
  theme: 'default',
  categories: defaultCategories
};

export default function Content() {
  const [settings, setSettings] = useState<ContentSettings>(defaultSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ContentCategory | null>(null);
  const { toast } = useToast();

  const categoryForm = useForm<ContentCategory>({
    defaultValues: {
      id: '',
      name: '',
      color: '#3B82F6',
      icon: '📁',
      description: '',
      isVisible: true,
      displayOrder: 1
    }
  });

  // Récupérer les vrais contenus depuis l'API
  const { data: content = [], isLoading: isLoadingContent } = useQuery({
    queryKey: ["/api/contents"],
  });
  
  const featuredContent = content.filter((item: ContentItem) => item.isFeatured);

  const form = useForm({
    defaultValues: {
      title: "",
      type: "document",
      category: "",
      description: "",
      tags: "",
      isFeatured: false,
      allowDownload: true
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/contents", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Contenu ajouté",
        description: "Le nouveau contenu a été publié avec succès.",
      });
      setShowUpload(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le contenu.",
        variant: "destructive",
      });
    },
  });

  const addCategory = (categoryData: Omit<ContentCategory, 'id'>) => {
    const newCategory: ContentCategory = {
      ...categoryData,
      id: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
    };
    
    setSettings(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory].sort((a, b) => a.displayOrder - b.displayOrder)
    }));
    
    toast({
      title: "Catégorie ajoutée",
      description: `La catégorie "${newCategory.name}" a été créée avec succès.`,
    });
  };

  const updateCategory = (categoryId: string, updates: Partial<ContentCategory>) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    }));
    
    toast({
      title: "Catégorie mise à jour",
      description: "Les modifications ont été sauvegardées.",
    });
  };

  const deleteCategory = (categoryId: string) => {
    const category = settings.categories.find(cat => cat.id === categoryId);
    
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
      categoriesVisible: prev.categoriesVisible.filter(name => name !== category?.name)
    }));
    
    toast({
      title: "Catégorie supprimée",
      description: `La catégorie "${category?.name}" a été supprimée.`,
    });
  };

  const reorderCategories = (startIndex: number, endIndex: number) => {
    const result = Array.from(settings.categories);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Mettre à jour l'ordre d'affichage
    const updatedCategories = result.map((cat, index) => ({
      ...cat,
      displayOrder: index + 1
    }));
    
    setSettings(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const filteredContent = content
    .filter(item => selectedCategory === "all" || item.category === selectedCategory)
    .filter(item => searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      switch (settings.sortBy) {
        case 'popularity':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'document': return FileText;
      case 'audio': return Music;
      default: return Archive;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'image': return 'bg-green-100 text-green-700';
      case 'document': return 'bg-blue-100 text-blue-700';
      case 'audio': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderContentItem = (item: ContentItem) => {
    const TypeIcon = getTypeIcon(item.type);
    
    if (settings.viewMode === 'list') {
      return (
        <GlassCard key={item.id} className="p-6 hover-lift">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
              {item.thumbnailUrl ? (
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <TypeIcon className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                <Badge className={getTypeColor(item.type)}>
                  {item.type}
                </Badge>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                </span>
                
                {settings.showViews && (
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.viewCount || 0} vues</span>
                  </span>
                )}
                
                {settings.showRatings && (
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating || 0}</span>
                  </span>
                )}
                
                {item.duration && (
                  <span className="flex items-center space-x-1">
                    <Play className="w-4 h-4" />
                    <span>{item.duration}</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              {settings.allowDownloads && (
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      );
    }

    // Vue grille
    return (
      <GlassCard key={item.id} className="overflow-hidden hover-lift group">
        <div className="aspect-video relative overflow-hidden">
          {item.thumbnailUrl ? (
            <img 
              src={item.thumbnailUrl} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <TypeIcon className="w-12 h-12 text-primary" />
            </div>
          )}
          
          {item.isPopular && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white">
              <TrendingUp className="w-3 h-3 mr-1" />
              Populaire
            </Badge>
          )}
          
          {item.duration && (
            <Badge className="absolute bottom-3 right-3 bg-black/60 text-white">
              {item.duration}
            </Badge>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" className="rounded-full">
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge className={getTypeColor(item.type)}>
              {item.type}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {settings.showViews && (
                <span className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{item.viewCount || 0}</span>
                </span>
              )}
              
              {settings.showRatings && (
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{item.rating || 0}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Heart className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <MainLayout>
      <div className="py-8 px-6">
        {/* Header avec actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contenus</h1>
            <p className="text-gray-600">Médiathèque et ressources de l'entreprise</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Personnaliser</span>
            </Button>
            
            <Link href="/create-content">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Ajouter du contenu</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher du contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {settings.categories
                .filter(cat => cat.isVisible)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={settings.viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, viewMode: 'grid' }))}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={settings.viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, viewMode: 'list' }))}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Section mise en avant */}
        {settings.featuredSection && featuredContent.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Contenus mis en avant
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredContent.map(renderContentItem)}
            </div>
          </div>
        )}

        {/* Grille/Liste des contenus */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Tous les contenus ({filteredContent.length})
            </h2>
            
            <Select 
              value={settings.sortBy} 
              onValueChange={(value: any) => setSettings(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Plus récents</SelectItem>
                <SelectItem value="popularity">Plus populaires</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
                <SelectItem value="title">Alphabétique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Chargement des contenus...</span>
              </div>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun contenu trouvé</h3>
              <p className="text-gray-600 mb-6">
                {content.length === 0 
                  ? "Aucun contenu n'a encore été publié. Commencez par créer votre premier contenu !"
                  : "Aucun contenu ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche."
                }
              </p>
              <Link href="/create-content">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer du contenu
                </Button>
              </Link>
            </div>
          ) : (
            <div className={
              settings.viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredContent.map(renderContentItem)}
            </div>
          )}
        </div>

        {/* Dialog de personnalisation */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Personnaliser la vue Contenus</span>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="display" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="display">Affichage</TabsTrigger>
                <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="display" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mode d'affichage par défaut</Label>
                    <Select 
                      value={settings.viewMode} 
                      onValueChange={(value: any) => setSettings(prev => ({ ...prev, viewMode: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grille</SelectItem>
                        <SelectItem value="list">Liste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Éléments par page</Label>
                    <Select 
                      value={settings.itemsPerPage.toString()} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, itemsPerPage: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Afficher les notes</Label>
                    <Switch
                      checked={settings.showRatings}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showRatings: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Afficher le nombre de vues</Label>
                    <Switch
                      checked={settings.showViews}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showViews: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Section contenus mis en avant</Label>
                    <Switch
                      checked={settings.featuredSection}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, featuredSection: checked }))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Autoriser les téléchargements</Label>
                    <Switch
                      checked={settings.allowDownloads}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowDownloads: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Activer les commentaires</Label>
                    <Switch
                      checked={settings.enableComments}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableComments: checked }))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Gestion des catégories</Label>
                  <Button 
                    onClick={() => setShowCategoryManager(true)}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Gérer les catégories</span>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {settings.categories
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(category => (
                      <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <Label className="font-medium">{category.name}</Label>
                            <p className="text-xs text-gray-500">{category.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={category.isVisible}
                          onCheckedChange={(checked) => {
                            updateCategory(category.id, { isVisible: checked });
                            setSettings(prev => ({
                              ...prev,
                              categoriesVisible: checked 
                                ? [...prev.categoriesVisible.filter(c => c !== category.name), category.name]
                                : prev.categoriesVisible.filter(c => c !== category.name)
                            }));
                          }}
                        />
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Paramètres sauvegardés",
                  description: "Vos préférences ont été mises à jour.",
                });
                setShowSettings(false);
              }}>
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'ajout de contenu */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Ajouter du contenu</span>
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => uploadMutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Titre du contenu" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="video">Vidéo</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {settings.categories
                              .filter(cat => cat.isVisible)
                              .sort((a, b) => a.displayOrder - b.displayOrder)
                              .map(category => (
                                <SelectItem key={category.id} value={category.name}>
                                  <div className="flex items-center space-x-2">
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Description du contenu..." rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (séparés par des virgules)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="formation, guide, nouveaux employés" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center space-x-6">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Mettre en avant</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="allowDownload"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Autoriser le téléchargement</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? "Ajout en cours..." : "Ajouter le contenu"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog de gestion des catégories */}
        <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Gestion des catégories</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liste des catégories existantes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Catégories existantes</h3>
                  <Badge variant="secondary">{settings.categories.length} catégories</Badge>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {settings.categories
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((category, index) => (
                      <Card key={category.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border-2" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-xl">{category.icon}</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={category.isVisible ? "default" : "secondary"}>
                              {category.isVisible ? "Visible" : "Masquée"}
                            </Badge>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(category);
                                categoryForm.reset(category);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            
                            {settings.categories.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
              
              {/* Formulaire d'ajout/modification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
                </h3>
                
                <Form {...categoryForm}>
                  <form 
                    onSubmit={categoryForm.handleSubmit((data) => {
                      if (editingCategory) {
                        updateCategory(editingCategory.id, data);
                        setEditingCategory(null);
                      } else {
                        addCategory(data);
                      }
                      categoryForm.reset();
                    })} 
                    className="space-y-4"
                  >
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la catégorie</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Ressources RH" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icône (emoji)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="📁" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={categoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input 
                                  {...field} 
                                  type="color" 
                                  className="w-16 h-10 p-1 rounded cursor-pointer"
                                />
                                <Input 
                                  {...field} 
                                  placeholder="#3B82F6"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Description de la catégorie..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ordre d'affichage</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="1"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={categoryForm.control}
                        name="isVisible"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 pt-8">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Visible par défaut</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingCategory ? "Mettre à jour" : "Ajouter la catégorie"}
                      </Button>
                      
                      {editingCategory && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(null);
                            categoryForm.reset();
                          }}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCategoryManager(false);
                  setEditingCategory(null);
                  categoryForm.reset();
                }}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}