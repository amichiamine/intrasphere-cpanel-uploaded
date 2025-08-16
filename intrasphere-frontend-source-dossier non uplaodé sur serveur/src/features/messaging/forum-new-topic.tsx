import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Badge } from "@/core/components/ui/badge";
import { useToast } from "@/core/hooks/use-toast";
import { 
  ArrowLeft,
  Send,
  AlertTriangle,
  Pin,
  Lock
} from "lucide-react";
import { apiRequest } from "@/core/lib/queryClient";
import type { ForumCategory } from "@shared/schema";

const newTopicSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  isPinned: z.boolean().optional(),
  isAnnouncement: z.boolean().optional(),
  tags: z.string().optional(),
});

type NewTopicForm = z.infer<typeof newTopicSchema>;

export function ForumNewTopicPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Fetch forum categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ['/api/forum/categories'],
  });

  // Fetch current user to check permissions
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/me'],
  });

  const form = useForm<NewTopicForm>({
    resolver: zodResolver(newTopicSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      content: "",
      isPinned: false,
      isAnnouncement: false,
      tags: "",
    },
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      // First create the topic
      const topic = await apiRequest('/api/forum/topics', 'POST', topicData);

      // Then create the first post with the content
      await apiRequest('/api/forum/posts', 'POST', {
        topicId: topic.id,
        content: topicData.content,
        isFirstPost: true,
      });

      return topic;
    },
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/categories'] });
      
      toast({
        title: "Sujet créé",
        description: "Votre nouveau sujet a été publié avec succès.",
      });

      navigate(`/forum/topic/${topic.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le sujet.",
        variant: "destructive",
      });
    },
  });

  const addTag = () => {
    if (currentTag.trim() && !selectedTags.includes(currentTag.trim())) {
      const newTags = [...selectedTags, currentTag.trim()];
      setSelectedTags(newTags);
      form.setValue('tags', JSON.stringify(newTags));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    form.setValue('tags', JSON.stringify(newTags));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = (data: NewTopicForm) => {
    const topicData = {
      ...data,
      tags: selectedTags.length > 0 ? JSON.stringify(selectedTags) : null,
    };

    createTopicMutation.mutate(topicData);
  };

  const canCreateAnnouncement = currentUser && ['admin', 'moderator'].includes(currentUser.role);
  const canPinTopic = currentUser && ['admin', 'moderator'].includes(currentUser.role);

  return (
    <div className="p-6 space-y-6" data-testid="forum-new-topic-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/forum')}
          data-testid="button-back-to-forum"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au forum
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Créer un nouveau sujet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Partagez vos idées et lancez une discussion
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du sujet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Catégorie *</Label>
              <Select
                value={form.watch('categoryId')}
                onValueChange={(value) => form.setValue('categoryId', value)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre du sujet *</Label>
              <Input
                id="title"
                placeholder="Un titre clair et descriptif..."
                {...form.register('title')}
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Input
                id="description"
                placeholder="Une brève description du sujet..."
                {...form.register('description')}
                data-testid="input-description"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Message *</Label>
              <Textarea
                id="content"
                placeholder="Écrivez votre message ici..."
                className="min-h-[200px]"
                {...form.register('content')}
                data-testid="textarea-content"
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    data-testid="input-tag"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTag}
                    data-testid="button-add-tag"
                  >
                    Ajouter
                  </Button>
                </div>
                
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                        data-testid={`tag-${index}`}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Admin/Moderator Options */}
            {(canCreateAnnouncement || canPinTopic) && (
              <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Options de modération</span>
                </div>
                
                <div className="space-y-3">
                  {canCreateAnnouncement && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAnnouncement"
                        checked={form.watch('isAnnouncement')}
                        onCheckedChange={(checked) => form.setValue('isAnnouncement', !!checked)}
                        data-testid="checkbox-announcement"
                      />
                      <Label htmlFor="isAnnouncement" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Marquer comme annonce officielle
                      </Label>
                    </div>
                  )}

                  {canPinTopic && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPinned"
                        checked={form.watch('isPinned')}
                        onCheckedChange={(checked) => form.setValue('isPinned', !!checked)}
                        data-testid="checkbox-pinned"
                      />
                      <Label htmlFor="isPinned" className="flex items-center gap-2">
                        <Pin className="h-4 w-4" />
                        Épingler en haut de la catégorie
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser ? (
                  <span>Vous publiez en tant que {currentUser.name}</span>
                ) : (
                  <span>Vous devez être connecté pour créer un sujet</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/forum')}
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
                
                <Button 
                  type="submit"
                  disabled={!currentUser || createTopicMutation.isPending || categoriesLoading}
                  data-testid="button-submit"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createTopicMutation.isPending ? "Publication..." : "Publier le sujet"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {!currentUser && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous devez être connecté pour créer un nouveau sujet.
            </p>
            <Button onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}