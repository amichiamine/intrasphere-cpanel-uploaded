import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { Switch } from "@/core/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Badge } from "@/core/components/ui/badge";
import { Separator } from "@/core/components/ui/separator";
import { useToast } from "@/core/hooks/use-toast";
import { 
  Settings, 
  User, 
  Palette, 
  Shield, 
  Bell, 
  Globe, 
  Save, 
  RotateCcw,
  Eye,
  Monitor,
  Moon,
  Sun,
  Download,
  Trash2,
  Zap,
  Database,
  Lock,
  Activity,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  ChevronDown,
  Check,
  Upload,
  Camera
} from "lucide-react";
import { applyThemeToDOM } from "@/core/hooks/useTheme";
import { useAuth } from "@/core/hooks/useAuth";
import { apiRequest, queryClient } from "@/core/lib/queryClient";

interface UserSettings {
  // Company/Site settings
  companyName: string;
  companyLogo: string;
  welcomeMessage: string;
  contactEmail: string;
  
  // Profile settings
  displayName: string;
  email: string;
  bio: string;
  department: string;
  position: string;
  phoneNumber: string;
  location: string;
  profilePicture: string;
  
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  announcementNotifications: boolean;
  messageNotifications: boolean;
  eventReminders: boolean;
  documentUpdates: boolean;
  weeklyDigest: boolean;
  
  // Appearance settings
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en' | 'es' | 'de';
  compactMode: boolean;
  showSidebar: boolean;
  animationsEnabled: boolean;
  colorScheme: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  fontSize: 'small' | 'medium' | 'large';
  
  // Privacy settings
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  shareActivityStatus: boolean;
  showEmailInDirectory: boolean;
  allowProfilePicture: boolean;
  
  // Advanced settings
  developerMode: boolean;
  betaFeatures: boolean;
  analyticsEnabled: boolean;
  autoSave: boolean;
  sessionTimeout: number;
}

// Custom Select Component
const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Sélectionner..."
}: { 
  value: string, 
  onChange: (value: string) => void, 
  options: { value: string, label: string }[],
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors text-left flex items-center justify-between"
      >
        <span>{options.find(opt => opt.value === value)?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-600`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors flex items-center justify-between ${
                value === option.value ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
              } first:rounded-t-lg last:rounded-b-lg`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 text-purple-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Color Scheme Selector Component
const ColorSchemeSelector = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => {
  const schemes = [
    { name: 'purple', label: 'Violet', color: '#8B5CF6' },
    { name: 'blue', label: 'Bleu', color: '#3B82F6' },
    { name: 'green', label: 'Vert', color: '#10B981' },
    { name: 'orange', label: 'Orange', color: '#F97316' },
    { name: 'red', label: 'Rouge', color: '#EF4444' }
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {schemes.map((scheme) => (
        <button
          key={scheme.name}
          type="button"
          onClick={() => onChange(scheme.name)}
          className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
            value === scheme.name 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div 
            className="w-8 h-8 rounded-full mx-auto mb-2"
            style={{ backgroundColor: scheme.color }}
          />
          <span className="text-xs font-medium">{scheme.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [localSettings, setLocalSettings] = useState<UserSettings>({
    // Company/Site settings
    companyName: "IntraSphere",
    companyLogo: "",
    welcomeMessage: "Bienvenue sur votre portail d'entreprise",
    contactEmail: "contact@intrasphere.com",
    
    // Profile settings
    displayName: "Jean Dupont",
    email: "jean.dupont@entreprise.com",
    bio: "Développeur Full Stack passionné par les nouvelles technologies et l'innovation.",
    department: "Développement",
    position: "Senior Developer",
    phoneNumber: "+33 1 23 45 67 89",
    location: "Paris, France",
    profilePicture: "",
    
    // Notification preferences
    emailNotifications: true,
    pushNotifications: false,
    desktopNotifications: true,
    announcementNotifications: true,
    messageNotifications: true,
    eventReminders: true,
    documentUpdates: false,
    weeklyDigest: true,
    
    // Appearance settings
    theme: 'light',
    language: 'fr',
    compactMode: false,
    showSidebar: true,
    animationsEnabled: true,
    colorScheme: 'purple',
    fontSize: 'medium',
    
    // Privacy settings
    profileVisible: true,
    showOnlineStatus: false,
    allowDirectMessages: true,
    shareActivityStatus: true,
    showEmailInDirectory: false,
    allowProfilePicture: true,
    
    // Advanced settings
    developerMode: false,
    betaFeatures: false,
    analyticsEnabled: true,
    autoSave: true,
    sessionTimeout: 60
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Apply theme using the custom hook only on initial load
  // The local applyThemeChanges function handles immediate updates

  // Fetch user settings
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await fetch('/api/user/settings');
      if (!response.ok) {
        // Return default settings if none exist
        if (response.status === 404) {
          return localSettings;
        }
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    }
  });

  // Initialize local settings when data is loaded
  useEffect(() => {
    if (userSettings) {
      setLocalSettings(userSettings);
      setHasChanges(false);
      // Apply theme on initial load
      applyThemeChanges(userSettings);
    }
  }, [userSettings]);

  // Apply theme changes on component mount and whenever localSettings change
  useEffect(() => {
    if (localSettings && Object.keys(localSettings).length > 0) {
      applyThemeChanges(localSettings);
    }
  }, [localSettings.colorScheme, localSettings.theme, localSettings.fontSize]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: UserSettings) => {
      return await apiRequest('/api/user/settings', 'POST', settings);
    },
    onSuccess: () => {
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      setHasChanges(false);
      
      // Apply theme changes immediately
      applyThemeChanges(localSettings);
    },
    onError: (error: any) => {
      console.error('Save settings mutation error:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: `Impossible de sauvegarder les paramètres: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Theme utility functions removed - now using centralized functions from useTheme

  // Apply theme changes immediately using centralized function
  const applyThemeChanges = (settings: UserSettings) => {
    applyThemeToDOM({
      colorScheme: settings.colorScheme,
      theme: settings.theme,
      fontSize: settings.fontSize
    });
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
    
    // Apply visual changes immediately for appearance settings
    if (['colorScheme', 'theme', 'fontSize'].includes(key as string)) {
      applyThemeChanges(newSettings);
    }
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(localSettings);
  };

  const resetToDefault = () => {
    const defaultSettings: UserSettings = {
      companyName: "IntraSphere",
      companyLogo: "",
      welcomeMessage: "Bienvenue sur votre portail d'entreprise",
      contactEmail: "contact@intrasphere.com",
      displayName: "Utilisateur",
      email: "utilisateur@entreprise.com",
      bio: "",
      department: "Non spécifié",
      position: "Employé",
      phoneNumber: "",
      location: "",
      profilePicture: "",
      emailNotifications: true,
      pushNotifications: false,
      desktopNotifications: true,
      announcementNotifications: true,
      messageNotifications: true,
      eventReminders: true,
      documentUpdates: false,
      weeklyDigest: true,
      theme: 'light',
      language: 'fr',
      compactMode: false,
      showSidebar: true,
      animationsEnabled: true,
      colorScheme: 'purple',
      fontSize: 'medium',
      profileVisible: true,
      showOnlineStatus: false,
      allowDirectMessages: true,
      shareActivityStatus: true,
      showEmailInDirectory: false,
      allowProfilePicture: true,
      developerMode: false,
      betaFeatures: false,
      analyticsEnabled: true,
      autoSave: true,
      sessionTimeout: 60
    };
    
    setLocalSettings(defaultSettings);
    setHasChanges(true);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les valeurs par défaut ont été restaurées. Pensez à sauvegarder.",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `intrasphere-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Paramètres exportés",
      description: "Vos paramètres ont été téléchargés avec succès.",
    });
  };

  // Mutation for resetting test data (admin only)
  const resetTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/reset-test-data', 'POST');
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast({
        title: "Données réinitialisées",
        description: data.message || "Les données de test ont été réinitialisées avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser les données de test.",
        variant: "destructive",
      });
    }
  });

  const handleResetTestData = () => {
    if (window.confirm("⚠️ Cette action va réinitialiser toutes les données avec les données de test par défaut. Cette action est irréversible. Continuer ?")) {
      resetTestDataMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const departmentOptions = [
    { value: "Développement", label: "Développement" },
    { value: "Marketing", label: "Marketing" },
    { value: "Ventes", label: "Ventes" },
    { value: "RH", label: "Ressources Humaines" },
    { value: "Finance", label: "Finance" },
    { value: "Direction", label: "Direction" },
    { value: "Support", label: "Support Client" },
    { value: "Production", label: "Production" },
    { value: "Qualité", label: "Assurance Qualité" },
    { value: "Autre", label: "Autre" }
  ];

  const themeOptions = [
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
    { value: "auto", label: "Automatique" }
  ];

  const languageOptions = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" }
  ];

  const fontSizeOptions = [
    { value: "small", label: "Petit" },
    { value: "medium", label: "Moyen" },
    { value: "large", label: "Grand" }
  ];

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
              Paramètres
            </h1>
            <p className="text-gray-600 mt-2">
              Personnalisez votre expérience IntraSphere selon vos préférences
            </p>
            {hasChanges && (
              <Badge className="mt-2 bg-orange-100 text-orange-800">
                Modifications non sauvegardées
              </Badge>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={resetToDefault}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || saveSettingsMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveSettingsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>

        {/* Main Settings */}
        <Tabs defaultValue={user?.role === "admin" ? "company" : "profile"} className="space-y-6">
          <TabsList className={`grid w-full ${user?.role === "admin" ? "grid-cols-7" : "grid-cols-5"}`}>
            {user?.role === "admin" && (
              <TabsTrigger value="company">Entreprise</TabsTrigger>
            )}
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="advanced">Avancé</TabsTrigger>
            )}
            {user?.role === "admin" && (
              <TabsTrigger value="admin" className="text-red-600 font-medium">
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          {/* Company/Site Tab - Admin Only */}
          {user?.role === "admin" && (
            <TabsContent value="company" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold">Informations de l'Entreprise</h2>
                  <p className="text-gray-600 text-sm">
                    Personnalisez l'identité et les informations de votre organisation
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input
                      id="companyName"
                      value={localSettings.companyName}
                      onChange={(e) => updateSetting('companyName', e.target.value)}
                      placeholder="Nom de votre entreprise"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={localSettings.contactEmail}
                      onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      placeholder="contact@votre-entreprise.com"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Message d'accueil</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={localSettings.welcomeMessage}
                    onChange={(e) => updateSetting('welcomeMessage', e.target.value)}
                    placeholder="Message affiché sur la page d'accueil..."
                    rows={2}
                    className="transition-all focus:ring-2 focus:ring-purple-200"
                  />
                  <p className="text-xs text-gray-500">
                    Ce message apparaîtra sur le tableau de bord principal
                  </p>
                </div>

                {/* Logo Upload Section */}
                <div className="space-y-2">
                  <Label>Logo de l'entreprise</Label>
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold border-2 border-gray-200">
                        {localSettings.companyLogo ? (
                          <img 
                            src={localSettings.companyLogo} 
                            alt="Logo" 
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          localSettings.companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-3">
                        Ajoutez le logo de votre entreprise (recommandé : 200x200px, PNG/JPG)
                      </p>
                      <div className="flex space-x-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Télécharger le logo
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const result = e.target?.result as string;
                                updateSetting('companyLogo', result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {localSettings.companyLogo && (
                          <Button size="sm" variant="outline" onClick={() => updateSetting('companyLogo', '')}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <Separator />
                <div className="space-y-2">
                  <Label>Aperçu</Label>
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {localSettings.companyLogo ? (
                          <img 
                            src={localSettings.companyLogo} 
                            alt="Logo" 
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          localSettings.companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{localSettings.companyName}</h3>
                        <p className="text-sm text-gray-600">Portail d'Entreprise</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      "{localSettings.welcomeMessage}"
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
            </TabsContent>
          )}

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold">Informations Personnelles</h2>
                  <p className="text-gray-600 text-sm">
                    Gérez vos informations de profil et préférences personnelles
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                      {localSettings.profilePicture ? (
                        <img 
                          src={localSettings.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        localSettings.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Photo de profil</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Ajoutez une photo pour personnaliser votre profil
                    </p>
                    <div className="flex space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => document.getElementById('profile-upload')?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Changer la photo
                      </Button>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const result = e.target?.result as string;
                              updateSetting('profilePicture', result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {localSettings.profilePicture && (
                        <Button size="sm" variant="outline" onClick={() => updateSetting('profilePicture', '')}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage *</Label>
                    <Input
                      id="displayName"
                      value={localSettings.displayName}
                      onChange={(e) => updateSetting('displayName', e.target.value)}
                      placeholder="Votre nom complet"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={localSettings.email}
                      onChange={(e) => updateSetting('email', e.target.value)}
                      placeholder="votre.email@entreprise.com"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <CustomSelect
                      value={localSettings.department}
                      onChange={(value) => updateSetting('department', value)}
                      options={departmentOptions}
                      placeholder="Sélectionner un département"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste</Label>
                    <Input
                      id="position"
                      value={localSettings.position}
                      onChange={(e) => updateSetting('position', e.target.value)}
                      placeholder="Votre titre de poste"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Téléphone</Label>
                    <Input
                      id="phoneNumber"
                      value={localSettings.phoneNumber}
                      onChange={(e) => updateSetting('phoneNumber', e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={localSettings.location}
                      onChange={(e) => updateSetting('location', e.target.value)}
                      placeholder="Ville, Pays"
                      className="transition-all focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={localSettings.bio}
                    onChange={(e) => updateSetting('bio', e.target.value)}
                    placeholder="Parlez de vous, vos compétences, vos centres d'intérêt..."
                    rows={4}
                    className="transition-all focus:ring-2 focus:ring-purple-200"
                  />
                  <p className="text-xs text-gray-500">
                    Cette information apparaîtra sur votre profil dans l'annuaire
                  </p>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold">Préférences de Notification</h2>
                  <p className="text-gray-600 text-sm">
                    Choisissez comment et quand vous souhaitez être notifié
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span>Canaux de notification</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notifications par email</Label>
                        <p className="text-sm text-gray-500">Recevez les notifications importantes par email</p>
                      </div>
                      <Switch
                        checked={localSettings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notifications push</Label>
                        <p className="text-sm text-gray-500">Notifications en temps réel dans le navigateur</p>
                      </div>
                      <Switch
                        checked={localSettings.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notifications bureau</Label>
                        <p className="text-sm text-gray-500">Alertes système sur votre ordinateur</p>
                      </div>
                      <Switch
                        checked={localSettings.desktopNotifications}
                        onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>Types de contenu</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Nouvelles annonces</Label>
                        <p className="text-sm text-gray-500">Communications officielles de l'entreprise</p>
                      </div>
                      <Switch
                        checked={localSettings.announcementNotifications}
                        onCheckedChange={(checked) => updateSetting('announcementNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Messages privés</Label>
                        <p className="text-sm text-gray-500">Messages directs de vos collègues</p>
                      </div>
                      <Switch
                        checked={localSettings.messageNotifications}
                        onCheckedChange={(checked) => updateSetting('messageNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Rappels d'événements</Label>
                        <p className="text-sm text-gray-500">Alertes avant les événements importants</p>
                      </div>
                      <Switch
                        checked={localSettings.eventReminders}
                        onCheckedChange={(checked) => updateSetting('eventReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Mises à jour de documents</Label>
                        <p className="text-sm text-gray-500">Nouveaux documents et modifications</p>
                      </div>
                      <Switch
                        checked={localSettings.documentUpdates}
                        onCheckedChange={(checked) => updateSetting('documentUpdates', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Résumé hebdomadaire</Label>
                        <p className="text-sm text-gray-500">Récapitulatif des activités de la semaine</p>
                      </div>
                      <Switch
                        checked={localSettings.weeklyDigest}
                        onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold">Personnalisation de l'Interface</h2>
                  <p className="text-gray-600 text-sm">
                    Adaptez l'apparence selon vos préférences visuelles
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Thème</Label>
                    <CustomSelect
                      value={localSettings.theme}
                      onChange={(value) => updateSetting('theme', value as UserSettings['theme'])}
                      options={themeOptions}
                    />
                    <p className="text-xs text-gray-500">
                      Le mode automatique s'adapte aux préférences de votre système
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Langue de l'interface</Label>
                    <CustomSelect
                      value={localSettings.language}
                      onChange={(value) => updateSetting('language', value as UserSettings['language'])}
                      options={languageOptions}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taille de police</Label>
                    <CustomSelect
                      value={localSettings.fontSize}
                      onChange={(value) => updateSetting('fontSize', value as UserSettings['fontSize'])}
                      options={fontSizeOptions}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schéma de couleurs</Label>
                  <ColorSchemeSelector
                    value={localSettings.colorScheme}
                    onChange={(value) => updateSetting('colorScheme', value as UserSettings['colorScheme'])}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <span>Options d'affichage</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Mode compact</Label>
                        <p className="text-sm text-gray-500">Affichage plus dense pour plus de contenu</p>
                      </div>
                      <Switch
                        checked={localSettings.compactMode}
                        onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Barre latérale visible</Label>
                        <p className="text-sm text-gray-500">Afficher la navigation latérale par défaut</p>
                      </div>
                      <Switch
                        checked={localSettings.showSidebar}
                        onCheckedChange={(checked) => updateSetting('showSidebar', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Animations activées</Label>
                        <p className="text-sm text-gray-500">Transitions et effets visuels fluides</p>
                      </div>
                      <Switch
                        checked={localSettings.animationsEnabled}
                        onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold">Confidentialité et Sécurité</h2>
                  <p className="text-gray-600 text-sm">
                    Contrôlez qui peut voir vos informations et interactions
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span>Visibilité du profil</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Profil visible dans l'annuaire</Label>
                        <p className="text-sm text-gray-500">Votre profil apparaît dans les recherches</p>
                      </div>
                      <Switch
                        checked={localSettings.profileVisible}
                        onCheckedChange={(checked) => updateSetting('profileVisible', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Afficher l'email dans l'annuaire</Label>
                        <p className="text-sm text-gray-500">Votre adresse email est visible publiquement</p>
                      </div>
                      <Switch
                        checked={localSettings.showEmailInDirectory}
                        onCheckedChange={(checked) => updateSetting('showEmailInDirectory', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Photo de profil autorisée</Label>
                        <p className="text-sm text-gray-500">Possibilité d'ajouter une photo personnelle</p>
                      </div>
                      <Switch
                        checked={localSettings.allowProfilePicture}
                        onCheckedChange={(checked) => updateSetting('allowProfilePicture', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>Statut et activité</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Statut en ligne visible</Label>
                        <p className="text-sm text-gray-500">Indiquer quand vous êtes connecté</p>
                      </div>
                      <Switch
                        checked={localSettings.showOnlineStatus}
                        onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Partager l'activité récente</Label>
                        <p className="text-sm text-gray-500">Votre dernière activité est visible</p>
                      </div>
                      <Switch
                        checked={localSettings.shareActivityStatus}
                        onCheckedChange={(checked) => updateSetting('shareActivityStatus', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span>Communication</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Messages directs autorisés</Label>
                        <p className="text-sm text-gray-500">Les collègues peuvent vous envoyer des messages</p>
                      </div>
                      <Switch
                        checked={localSettings.allowDirectMessages}
                        onCheckedChange={(checked) => updateSetting('allowDirectMessages', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Advanced Tab */}
          {/* Advanced Tab - Admin Only */}
          {user?.role === "admin" && (
            <TabsContent value="advanced" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold">Paramètres Avancés</h2>
                  <p className="text-gray-600 text-sm">
                    Options techniques et fonctionnalités expérimentales
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-400 mt-0.5"></div>
                    <div>
                      <h4 className="font-medium text-yellow-800">Attention</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Ces paramètres sont destinés aux utilisateurs avancés. 
                        Modifiez-les uniquement si vous comprenez leurs implications.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span>Fonctionnalités</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Mode développeur</Label>
                        <p className="text-sm text-gray-500">Active les outils de développement et logs détaillés</p>
                      </div>
                      <Switch
                        checked={localSettings.developerMode}
                        onCheckedChange={(checked) => updateSetting('developerMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Fonctionnalités bêta</Label>
                        <p className="text-sm text-gray-500">Accès aux nouvelles fonctionnalités en test</p>
                      </div>
                      <Switch
                        checked={localSettings.betaFeatures}
                        onCheckedChange={(checked) => updateSetting('betaFeatures', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Sauvegarde automatique</Label>
                        <p className="text-sm text-gray-500">Sauvegarde automatique des brouillons</p>
                      </div>
                      <Switch
                        checked={localSettings.autoSave}
                        onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <span>Données et performance</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">Analytiques activées</Label>
                        <p className="text-sm text-gray-500">Aide à améliorer l'expérience utilisateur</p>
                      </div>
                      <Switch
                        checked={localSettings.analyticsEnabled}
                        onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Délai d'expiration de session (minutes)</Label>
                      <Input
                        type="number"
                        min="15"
                        max="480"
                        value={localSettings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 60)}
                        className="w-32"
                      />
                      <p className="text-xs text-gray-500">
                        Entre 15 et 480 minutes. Par défaut : 60 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Download className="w-5 h-5 text-purple-600" />
                    <span>Gestion des données</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Cache du navigateur</Label>
                      <p className="text-sm text-gray-500">
                        Gérer le cache local pour améliorer les performances
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          localStorage.clear();
                          sessionStorage.clear();
                          toast({
                            title: "Cache vidé",
                            description: "Le cache du navigateur a été effacé.",
                          });
                        }}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Vider le cache
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données locales ?')) {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.reload();
                          }
                        }}>
                          <Database className="w-4 h-4 mr-2" />
                          Réinitialiser les données locales
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>Exportation des données</Label>
                      <p className="text-sm text-gray-500">
                        Téléchargez une copie de vos paramètres personnels
                      </p>
                      <Button variant="outline" size="sm" className="w-fit" onClick={exportSettings}>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter mes paramètres
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
            </TabsContent>
          )}

          {/* Admin Tab - Only visible for admin users */}
          {user?.role === "admin" && (
            <TabsContent value="admin" className="space-y-6">
              <GlassCard className="p-6 border-red-200">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-red-600" />
                  <div>
                    <h2 className="text-xl font-bold text-red-700">Administration Système</h2>
                    <p className="text-red-600 text-sm">
                      Outils avancés réservés aux administrateurs
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Test Data Reset Section */}
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Database className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-800 mb-2">
                          Réinitialisation des Données de Test
                        </h3>
                        <p className="text-red-700 text-sm mb-4">
                          Cette action supprime toutes les données actuelles et les remplace par un jeu de données de test prédéfini.
                          <br />
                          <strong>⚠️ Cette action est irréversible et affectera :</strong>
                        </p>
                        <ul className="text-red-700 text-sm mb-4 space-y-1 ml-4">
                          <li>• Tous les utilisateurs (6 utilisateurs de test seront créés)</li>
                          <li>• Toutes les annonces (5 annonces de test)</li>
                          <li>• Tous les documents (4 documents de test)</li>
                          <li>• Tous les événements (3 événements de test)</li>
                          <li>• Tous les messages (3 messages de test)</li>
                          <li>• Toutes les réclamations (3 réclamations de test)</li>
                        </ul>
                        <div className="bg-red-100 p-3 rounded-lg border border-red-200 mb-4">
                          <p className="text-red-800 text-sm font-medium">
                            📋 Comptes de test qui seront créés :
                          </p>
                          <ul className="text-red-700 text-sm mt-2 space-y-1">
                            <li>• <strong>admin</strong> / admin123 (Administrateur)</li>
                            <li>• <strong>moderator</strong> / mod123 (Modérateur)</li>
                            <li>• <strong>employee</strong> / emp123 (Employé)</li>
                          </ul>
                        </div>
                        <Button
                          onClick={handleResetTestData}
                          disabled={resetTestDataMutation.isPending}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {resetTestDataMutation.isPending ? (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                              Réinitialisation...
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4 mr-2" />
                              Réinitialiser les Données de Test
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* System Information */}
                  <div>
                    <h3 className="font-medium mb-4 flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      <span>Informations Système</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Version</p>
                        <p className="font-medium">IntraSphere v1.0.0</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Mode</p>
                        <p className="font-medium">Développement</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Base de données</p>
                        <p className="font-medium">Mémoire (MemStorage)</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Dernière mise à jour</p>
                        <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}