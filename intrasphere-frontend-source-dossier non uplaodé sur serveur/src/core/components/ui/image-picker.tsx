import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Search, Upload, Image, Link as LinkIcon, CheckCircle } from "lucide-react";

interface ImagePickerProps {
  selectedImage?: string;
  onImageSelect: (imageUrl: string) => void;
  trigger?: React.ReactNode;
}

// Collection d'images professionnelles pour les contenus d'entreprise
const STOCK_IMAGES = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Formation",
    description: "Équipe collaborative",
    keywords: ["formation", "équipe", "collaboration", "bureau"]
  },
  {
    id: "2", 
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Bureau",
    description: "Espace de travail moderne",
    keywords: ["bureau", "moderne", "workspace", "professionnel"]
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Technologie",
    description: "Cybersécurité",
    keywords: ["sécurité", "technologie", "cyber", "protection"]
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Business",
    description: "Données et rapports",
    keywords: ["rapport", "données", "business", "analytics"]
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Réunion",
    description: "Réunion d'équipe",
    keywords: ["réunion", "meeting", "équipe", "discussion"]
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Formation",
    description: "Présentation",
    keywords: ["présentation", "formation", "apprentissage", "conference"]
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Teamwork",
    description: "Collaboration créative",
    keywords: ["créatif", "collaboration", "brainstorming", "innovation"]
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Communication",
    description: "Communication d'équipe",
    keywords: ["communication", "discussion", "échange", "dialogue"]
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Social",
    description: "Événement d'entreprise",
    keywords: ["événement", "social", "célébration", "équipe"]
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
    category: "Leadership",
    description: "Leadership et direction",
    keywords: ["leadership", "direction", "management", "guide"]
  }
];

export function ImagePicker({ selectedImage, onImageSelect, trigger }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(STOCK_IMAGES.map(img => img.category)))];
  
  const filteredImages = STOCK_IMAGES.filter(image => {
    const matchesSearch = searchTerm === "" || 
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleImageSelect = (imageUrl: string) => {
    try {
      onImageSelect(imageUrl);
      setOpen(false);
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleCustomUrlSubmit = () => {
    try {
      if (customUrl.trim()) {
        onImageSelect(customUrl.trim());
        setCustomUrl("");
        setOpen(false);
      }
    } catch (error) {
      console.error('Error submitting custom URL:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Choisir une image</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" aria-describedby="image-picker-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Sélectionner une image</span>
          </DialogTitle>
          <DialogDescription id="image-picker-description">
            Choisissez une image depuis la galerie, téléchargez votre propre fichier ou utilisez une URL personnalisée
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery">Galerie</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL personnalisée</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery" className="space-y-4">
            {/* Recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="mb-2"
                  >
                    {category === "all" ? "Toutes" : category}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Grille d'images */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredImages.map(image => (
                <Card 
                  key={image.id} 
                  className={`relative cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all ${
                    selectedImage === image.url ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleImageSelect(image.url)}
                >
                  <div className="aspect-video relative">
                    <img 
                      src={image.url} 
                      alt={image.description}
                      className="w-full h-full object-cover"
                    />
                    
                    {selectedImage === image.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary bg-white rounded-full" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {image.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{image.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            
            {filteredImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune image trouvée</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Télécharger une image</h3>
              <p className="text-gray-600 mb-4">
                Glissez-déposez votre image ici ou cliquez pour sélectionner
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={(e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Simulated file upload - in a real app, this would upload to storage
                      const fakeUrl = URL.createObjectURL(file);
                      handleImageSelect(fakeUrl);
                    }
                  } catch (error) {
                    console.error('Error handling file upload:', error);
                  }
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                Sélectionner un fichier
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-url">URL de l'image</Label>
                <div className="flex space-x-2 mt-1">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="custom-url"
                      placeholder="https://exemple.com/image.jpg"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleCustomUrlSubmit} disabled={!customUrl.trim()}>
                    Valider
                  </Button>
                </div>
              </div>
              
              {customUrl && (
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium">Aperçu :</Label>
                  <div className="mt-2">
                    <img 
                      src={customUrl} 
                      alt="Aperçu"
                      className="max-w-full h-32 object-cover rounded"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        // Afficher un message d'erreur à côté
                        const errorMsg = document.createElement('p');
                        errorMsg.textContent = 'URL d\'image invalide';
                        errorMsg.className = 'text-red-500 text-sm mt-2';
                        if (target.parentNode && !target.parentNode.querySelector('.error-message')) {
                          errorMsg.classList.add('error-message');
                          target.parentNode.appendChild(errorMsg);
                        }
                      }}
                      onLoad={(e) => {
                        // Supprimer le message d'erreur si l'image se charge
                        const errorMsg = (e.currentTarget.parentNode as Element)?.querySelector('.error-message');
                        if (errorMsg) {
                          errorMsg.remove();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}