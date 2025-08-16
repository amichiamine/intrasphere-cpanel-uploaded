import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Badge } from "@/core/components/ui/badge";
import { Search, Smile, CheckCircle } from "lucide-react";

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  trigger?: React.ReactNode;
}

// Bibliothèque d'icônes organisée par catégories
const ICON_LIBRARY = {
  "Entreprise": [
    "🏢", "💼", "📊", "📈", "📉", "💰", "💸", "💳", "🏦", "🏭",
    "🏗️", "🏪", "🏬", "🏫", "🏛️", "⚖️", "📋", "📄", "📑", "📝"
  ],
  "Communication": [
    "📞", "📱", "💬", "💭", "📧", "📨", "📩", "📤", "📥", "📮",
    "📪", "📫", "📬", "📭", "🗂️", "🗃️", "🗄️", "📰", "📻", "📺"
  ],
  "Formation": [
    "🎓", "📚", "📖", "📙", "📘", "📗", "📕", "📔", "📒", "📓",
    "🖊️", "✏️", "🖍️", "🖌️", "📐", "📏", "🧮", "🔬", "🔭", "🎯"
  ],
  "Social": [
    "🎉", "🎊", "🥳", "🎈", "🎁", "🍰", "🥂", "🍾", "🎵", "🎶",
    "🎤", "🎧", "📸", "📷", "🎬", "🎭", "🎨", "🎪", "🎠", "🎡"
  ],
  "Technologie": [
    "💻", "🖥️", "⌨️", "🖱️", "🖨️", "📱", "⌚", "📟", "💾", "💿",
    "📀", "🔌", "🔋", "🪫", "⚡", "💡", "🔦", "🕯️", "🛠️", "⚙️"
  ],
  "Transport": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "✈️", "🚁", "🚀"
  ],
  "Activités": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
    "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "⛳", "🏹", "🎣", "🤿"
  ],
  "Nature": [
    "🌿", "🌱", "🌳", "🌲", "🌴", "🎋", "🍃", "🍂", "🍁", "🌾",
    "🌺", "🌸", "🌼", "🌻", "🌷", "🌹", "🥀", "🌵", "🌿", "☘️"
  ],
  "Nourriture": [
    "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
    "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥕"
  ],
  "Voyage": [
    "✈️", "🧳", "🎒", "🏖️", "🏝️", "🏔️", "⛰️", "🏕️", "🏞️", "🎪",
    "🎠", "🎡", "🎢", "🚁", "🛸", "🚀", "🛩️", "🛫", "🛬", "🗺️"
  ]
};

const ALL_ICONS = Object.values(ICON_LIBRARY).flat();

export function IconPicker({ selectedIcon, onIconSelect, trigger }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customIcon, setCustomIcon] = useState("");

  const categories = ["all", ...Object.keys(ICON_LIBRARY)];
  
  const getFilteredIcons = () => {
    let icons = selectedCategory === "all" ? ALL_ICONS : ICON_LIBRARY[selectedCategory as keyof typeof ICON_LIBRARY] || [];
    
    if (searchTerm) {
      // Pour la recherche d'emojis, on peut chercher par nom de catégorie ou description
      const searchLower = searchTerm.toLowerCase();
      if (selectedCategory === "all") {
        // Recherche dans toutes les catégories
        icons = Object.entries(ICON_LIBRARY)
          .filter(([categoryName]) => categoryName.toLowerCase().includes(searchLower))
          .flatMap(([, categoryIcons]) => categoryIcons);
        
        if (icons.length === 0) {
          // Si aucune catégorie ne correspond, chercher l'emoji directement
          icons = ALL_ICONS.filter(icon => icon.includes(searchTerm));
        }
      }
    }
    
    return icons;
  };

  const filteredIcons = getFilteredIcons();

  const handleIconSelect = (icon: string) => {
    onIconSelect(icon);
    setOpen(false);
  };

  const handleCustomIconSubmit = () => {
    if (customIcon.trim()) {
      onIconSelect(customIcon.trim());
      setCustomIcon("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Smile className="w-4 h-4" />
            <span>Choisir une icône</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden" aria-describedby="icon-picker-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smile className="w-5 h-5" />
            <span>Sélectionner une icône</span>
          </DialogTitle>
          <DialogDescription id="icon-picker-description">
            Explorez notre bibliothèque d'icônes organisée par catégories ou ajoutez votre propre emoji
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Bibliothèque</TabsTrigger>
            <TabsTrigger value="custom">Personnalisé</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4">
            {/* Recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des icônes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Catégories */}
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
            
            {/* Grille d'icônes */}
            <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-96 overflow-y-auto p-2">
              {filteredIcons.map((icon, index) => (
                <Button
                  key={`${icon}-${index}`}
                  variant="ghost"
                  size="sm"
                  className={`h-12 w-12 text-2xl hover:bg-primary/10 relative ${
                    selectedIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleIconSelect(icon)}
                >
                  {icon}
                  {selectedIcon === icon && (
                    <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-white rounded-full" />
                  )}
                </Button>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune icône trouvée</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Icône personnalisée</label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    placeholder="Tapez ou collez un emoji 😊"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    className="text-2xl"
                  />
                  <Button onClick={handleCustomIconSubmit} disabled={!customIcon.trim()}>
                    Valider
                  </Button>
                </div>
              </div>
              
              {customIcon && (
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-sm font-medium mb-2">Aperçu :</p>
                  <div className="text-6xl">{customIcon}</div>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Conseils :</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Utilisez n'importe quel emoji de votre clavier</li>
                  <li>• Copiez-collez des emojis depuis d'autres sources</li>
                  <li>• Les symboles Unicode sont aussi supportés</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}