import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { FileText, ArrowLeft, Save, Image } from "lucide-react";
import { useToast } from "@/core/hooks/use-toast";
import { apiRequest, queryClient } from "@/core/lib/queryClient";
import { insertContentSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { ImagePicker } from "@/core/components/ui/image-picker";
import { IconPicker } from "@/core/components/ui/icon-picker";
import { FileUploader } from "@/core/components/ui/file-uploader";

type ContentFormData = z.infer<typeof insertContentSchema>;

export default function CreateContent() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  
  const form = useForm<ContentFormData>({
    resolver: zodResolver(insertContentSchema),
    defaultValues: {
      title: "",
      type: "document",
      category: "",
      description: "",
      fileUrl: "",
      duration: "",
      isPopular: false,
      isFeatured: false,
      tags: [],
    }
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const enrichedData = {
        ...data,
        fileUrl: selectedFile || data.fileUrl,
        thumbnailUrl: selectedThumbnail || undefined,
      };
      await apiRequest("/api/contents", "POST", enrichedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Contenu créé",
        description: "Le nouveau contenu a été ajouté avec succès.",
      });
      setLocation("/content");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le contenu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContentFormData) => {
    createMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/content")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Créer du Contenu</h1>
            <p className="text-gray-600 mt-2">Ajouter un nouveau contenu à la plateforme</p>
          </div>
        </div>

        {/* Form */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Nouveau Contenu</CardTitle>
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
                        <FormLabel>Titre du contenu</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Guide d'utilisation des nouveaux outils"
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
                        <FormLabel>Type de contenu</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Vidéo</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(categories) && categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.icon} {category.name}
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
                        <Textarea 
                          {...field}
                          value={field.value || ""}
                          placeholder="Décrivez le contenu..."
                          className="min-h-[120px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Téléchargement de fichier */}
                <div className="space-y-4">
                  <FileUploader
                    contentType={form.watch("type") as "document" | "image" | "video" | "audio"}
                    onFileSelect={(fileUrl, fileName) => {
                      setSelectedFile(fileUrl);
                      setFileName(fileName || "");
                      form.setValue("fileUrl", fileUrl);
                    }}
                    selectedFile={selectedFile}
                    className="w-full"
                  />
                </div>

                {form.watch("type") === "video" && (
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            value={field.value || ""}
                            placeholder="Ex: 15 min"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Image de miniature */}
                <div className="space-y-2">
                  <Label>Image de miniature</Label>
                  <div className="flex items-center space-x-4">
                    <ImagePicker
                      selectedImage={selectedThumbnail}
                      onImageSelect={setSelectedThumbnail}
                      trigger={
                        <Button type="button" variant="outline" className="flex items-center space-x-2">
                          <Image className="w-4 h-4" />
                          <span>{selectedThumbnail ? "Modifier l'image" : "Ajouter une miniature"}</span>
                        </Button>
                      }
                    />
                    {selectedThumbnail && (
                      <div className="relative">
                        <img 
                          src={selectedThumbnail} 
                          alt="Aperçu" 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedThumbnail("")}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Contenu populaire</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Marquer comme populaire
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

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Contenu vedette</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mettre en avant
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
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/content")}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{createMutation.isPending ? "Création..." : "Créer le contenu"}</span>
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