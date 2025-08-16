import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { Switch } from "@/core/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Megaphone, ArrowLeft, Send, Image } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";
import { apiRequest, queryClient } from "@/core/lib/queryClient";
import { insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { ImagePicker } from "@/core/components/ui/image-picker";
import { IconPicker } from "@/core/components/ui/icon-picker";

type AnnouncementFormData = z.infer<typeof insertAnnouncementSchema>;

export default function CreateAnnouncement() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>("📢");
  
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "info",
      isImportant: false,
      authorName: "Jean Dupont", // Would come from current user in real app
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      const enrichedData = {
        ...data,
        authorId: "user-1", // Would come from current user in real app
        imageUrl: selectedImage || undefined,
        icon: selectedIcon
      };
      await apiRequest("/api/announcements", "POST", enrichedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Annonce créée",
        description: "L'annonce a été publiée avec succès.",
      });
      setLocation("/announcements");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'annonce.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    createMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/announcements")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Créer une Annonce</h1>
            <p className="text-gray-600 mt-2">Publier une nouvelle communication pour l'entreprise</p>
          </div>
        </div>

        {/* Form */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Nouvelle Annonce</CardTitle>
                <CardDescription>Remplissez les informations ci-dessous</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Titre de l'annonce</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Nouvelle politique de télétravail"
                            className="text-lg"
                          />
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
                        <FormLabel>Type d'annonce</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="important">Important</SelectItem>
                            <SelectItem value="event">Événement</SelectItem>
                            <SelectItem value="formation">Formation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auteur</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nom de l'auteur" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu de l'annonce</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Rédigez le contenu de votre annonce..."
                          className="min-h-[200px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isImportant"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Annonce importante
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Cette annonce sera mise en évidence avec une priorité élevée
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Sélecteur d'image */}
                <div className="space-y-2">
                  <Label>Image d'illustration</Label>
                  <div className="flex items-center space-x-4">
                    <ImagePicker
                      selectedImage={selectedImage}
                      onImageSelect={setSelectedImage}
                      trigger={
                        <Button type="button" variant="outline" className="flex items-center space-x-2">
                          <Image className="w-4 h-4" />
                          <span>{selectedImage ? "Modifier l'image" : "Ajouter une image"}</span>
                        </Button>
                      }
                    />
                    {selectedImage && (
                      <div className="relative">
                        <img 
                          src={selectedImage} 
                          alt="Aperçu" 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImage("")}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sélecteur d'icône */}
                <div className="space-y-2">
                  <Label>Icône de l'annonce</Label>
                  <div className="flex items-center space-x-4">
                    <IconPicker
                      selectedIcon={selectedIcon}
                      onIconSelect={setSelectedIcon}
                      trigger={
                        <Button type="button" variant="outline" className="flex items-center space-x-2">
                          <span className="text-xl">{selectedIcon}</span>
                          <span>Changer l'icône</span>
                        </Button>
                      }
                    />
                    <div className="text-3xl">{selectedIcon}</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/announcements")}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{createMutation.isPending ? "Publication..." : "Publier"}</span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}