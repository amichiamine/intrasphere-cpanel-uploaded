import { useState, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Progress } from "@/core/components/ui/progress";
import { Card } from "@/core/components/ui/card";
import { Upload, File, Image, Video, Music, FileText, X, CheckCircle } from "lucide-react";

interface FileUploaderProps {
  contentType: "document" | "image" | "video" | "audio";
  onFileSelect: (fileUrl: string, fileName?: string) => void;
  selectedFile?: string;
  className?: string;
}

const getAcceptedTypes = (contentType: string) => {
  switch (contentType) {
    case "image":
      return "image/*";
    case "video":
      return "video/*";
    case "audio":
      return "audio/*";
    case "document":
      return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf";
    default:
      return "*/*";
  }
};

const getFileIcon = (contentType: string) => {
  switch (contentType) {
    case "image":
      return <Image className="w-8 h-8 text-blue-500" />;
    case "video":
      return <Video className="w-8 h-8 text-purple-500" />;
    case "audio":
      return <Music className="w-8 h-8 text-green-500" />;
    case "document":
      return <FileText className="w-8 h-8 text-orange-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getTypeLabel = (contentType: string) => {
  switch (contentType) {
    case "image":
      return "Image";
    case "video":
      return "Vidéo";
    case "audio":
      return "Audio";
    case "document":
      return "Document";
    default:
      return "Fichier";
  }
};

export function FileUploader({ contentType, onFileSelect, selectedFile, className }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulation d'upload avec progression
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulated file upload - in a real app, this would upload to storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fakeUrl = URL.createObjectURL(file);
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onFileSelect(fakeUrl, file.name);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (customUrl.trim()) {
      onFileSelect(customUrl.trim(), customUrl.split('/').pop());
      setCustomUrl("");
    }
  };

  const clearSelection = () => {
    onFileSelect("", "");
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-3 block">
        Fichier {getTypeLabel(contentType)}
      </Label>
      
      {selectedFile ? (
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Fichier sélectionné</p>
                <p className="text-sm text-green-600 truncate max-w-60">
                  {selectedFile.split('/').pop() || selectedFile}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Zone de glisser-déposer */}
          <Card 
            className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center space-y-4">
              {isUploading ? (
                <>
                  <Upload className="w-12 h-12 text-blue-500 mx-auto animate-bounce" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Upload en cours...</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-xs text-gray-500">{uploadProgress}%</p>
                  </div>
                </>
              ) : (
                <>
                  {getFileIcon(contentType)}
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Glissez votre {getTypeLabel(contentType).toLowerCase()} ici
                    </p>
                    <p className="text-sm text-gray-500">
                      ou cliquez pour parcourir vos fichiers
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner un fichier
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedTypes(contentType)}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Option URL personnalisée */}
          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">
              Ou utiliser une URL
            </Label>
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder={`URL du ${getTypeLabel(contentType).toLowerCase()}...`}
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUrlSubmit}
                disabled={!customUrl.trim()}
              >
                Utiliser
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}