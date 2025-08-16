import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/core/components/layout/main-layout";
import { GlassCard } from "@/core/components/ui/glass-card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { MessageCircle, Send, Inbox, UserPlus, CheckCircle2 } from "lucide-react";
import { insertMessageSchema, type Message, type User } from "@shared/schema";
import { apiRequest } from "@/core/lib/queryClient";
import { useToast } from "@/core/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function Messages() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [openCompose, setOpenCompose] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // For demo purposes, using user-1 as current user
  const currentUserId = "user-1";

  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await fetch(`/api/messages`);
      if (!res.ok) {
        // Return empty array instead of throwing error to prevent crashes
        console.warn('Failed to fetch messages:', res.status);
        return [];
      }
      const data = await res.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      senderId: currentUserId,
      recipientId: "",
      subject: "",
      content: "",
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/messages`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      form.reset();
      setOpenCompose(false);
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest(`/api/messages/${messageId}/read`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const onSubmit = (data: any) => {
    createMessageMutation.mutate(data);
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead && message.recipientId === currentUserId) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const getMessagePartner = (message: Message) => {
    const partnerId = message.senderId === currentUserId ? message.recipientId : message.senderId;
    return users.find(user => user.id === partnerId);
  };

  // Ensure messages is always an array to prevent filter errors
  const safeMessages = Array.isArray(messages) ? messages : [];
  const unreadCount = safeMessages.filter(msg => !msg.isRead && msg.recipientId === currentUserId).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messagerie Interne
            </h1>
            <p className="text-gray-600 mt-2">
              Communication sécurisée entre employés
            </p>
          </div>
          <Dialog open={openCompose} onOpenChange={setOpenCompose}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <Send className="w-4 h-4 mr-2" />
                Nouveau Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau Message</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destinataire</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un employé" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.filter(user => user.id !== currentUserId).map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.employeeId}) - {user.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet</FormLabel>
                        <FormControl>
                          <Input placeholder="Objet du message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tapez votre message ici..." 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setOpenCompose(false)}>
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMessageMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {createMessageMutation.isPending ? "Envoi..." : "Envoyer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <GlassCard className="h-[600px] overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <Inbox className="w-5 h-5 text-blue-500" />
                  <h2 className="font-semibold">Boîte de réception</h2>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[520px]">
                {messagesLoading ? (
                  <div className="p-4 text-center text-gray-500">Chargement...</div>
                ) : safeMessages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    Aucun message
                  </div>
                ) : (
                  safeMessages.map((message) => {
                    const partner = getMessagePartner(message);
                    const isUnread = !message.isRead && message.recipientId === currentUserId;
                    
                    return (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                          selectedMessage?.id === message.id ? "bg-blue-500/10" : ""
                        } ${isUnread ? "bg-blue-500/5" : ""}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {partner?.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className={`font-medium truncate ${isUnread ? "text-blue-600" : "text-gray-900"}`}>
                                {partner?.name || "Utilisateur inconnu"}
                              </p>
                              {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                            <p className="text-xs text-gray-500">
                              {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { 
                                addSuffix: true, 
                                locale: fr 
                              }) : 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <GlassCard className="h-[600px]">
              {selectedMessage ? (
                <div className="h-full flex flex-col">
                  <div className="p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {getMessagePartner(selectedMessage)?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedMessage.subject}</h3>
                        <p className="text-sm text-gray-600">
                          De: {getMessagePartner(selectedMessage)?.name || "Utilisateur inconnu"} 
                          ({getMessagePartner(selectedMessage)?.employeeId})
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedMessage.createdAt ? formatDistanceToNow(new Date(selectedMessage.createdAt), { 
                            addSuffix: true, 
                            locale: fr 
                          }) : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/20">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const partner = getMessagePartner(selectedMessage);
                        if (partner) {
                          form.setValue("recipientId", partner.id);
                          form.setValue("subject", `Re: ${selectedMessage.subject}`);
                          setOpenCompose(true);
                        }
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Répondre
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Sélectionnez un message</p>
                    <p className="text-sm">Choisissez une conversation pour commencer</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}