import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/components/ui/avatar";
import { Textarea } from "@/core/components/ui/textarea";
import { Separator } from "@/core/components/ui/separator";
import { useToast } from "@/core/hooks/use-toast";
import { 
  MessageCircle, 
  Pin, 
  Users, 
  Eye, 
  Heart,
  Reply,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  Send,
  ThumbsUp,
  MoreVertical
} from "lucide-react";
import { apiRequest } from "@/core/lib/queryClient";
import type { ForumTopic, ForumPost, ForumCategory } from "@shared/schema";

export function ForumTopicPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [replyContent, setReplyContent] = useState("");
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch topic details
  const { data: topic, isLoading: topicLoading } = useQuery<ForumTopic>({
    queryKey: ['/api/forum/topics', id],
    enabled: !!id,
  });

  // Fetch category info
  const { data: category } = useQuery<ForumCategory>({
    queryKey: ['/api/forum/categories', topic?.categoryId],
    enabled: !!topic?.categoryId,
  });

  // Fetch posts for this topic
  const { data: posts = [], isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ['/api/forum/topics', id, 'posts'],
    enabled: !!id,
  });

  // Fetch current user
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/me'],
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: any) => apiRequest('/api/forum/posts', 'POST', postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', id, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', id] });
      setReplyContent("");
      toast({
        title: "Réponse publiée",
        description: "Votre message a été ajouté au sujet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier la réponse.",
        variant: "destructive",
      });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      apiRequest(`/api/forum/posts/${postId}`, 'PUT', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', id, 'posts'] });
      setEditingPost(null);
      setEditContent("");
      toast({
        title: "Message modifié",
        description: "Votre message a été mis à jour.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le message.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest(`/api/forum/posts/${postId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', id, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', id] });
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le message.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest(`/api/forum/posts/${postId}/like`, 'POST', { reactionType: 'like' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/topics', id, 'posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de liker le message.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !id) return;

    createPostMutation.mutate({
      topicId: id,
      content: replyContent.trim(),
      isFirstPost: false,
    });
  };

  const handleEditPost = (post: ForumPost) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = () => {
    if (!editingPost || !editContent.trim()) return;

    editPostMutation.mutate({
      postId: editingPost,
      content: editContent.trim(),
    });
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleLikePost = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const canEditPost = (post: ForumPost) => {
    return currentUser && (
      post.authorId === currentUser.id ||
      ['admin', 'moderator'].includes(currentUser.role)
    );
  };

  const canDeletePost = (post: ForumPost) => {
    return currentUser && (
      post.authorId === currentUser.id ||
      ['admin', 'moderator'].includes(currentUser.role)
    ) && !post.isFirstPost; // Can't delete the first post (topic content)
  };

  if (topicLoading || !topic) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="forum-topic-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/forum" className="hover:text-purple-600 dark:hover:text-purple-400">
          Forum
        </Link>
        <span>/</span>
        {category && (
          <>
            <span className="flex items-center gap-1">
              <span>{category.icon}</span>
              {category.name}
            </span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 dark:text-white truncate">{topic.title}</span>
      </div>

      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/forum')}
        className="mb-4"
        data-testid="button-back-to-forum"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au forum
      </Button>

      {/* Topic header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {topic.isPinned && (
                  <Pin className="h-5 w-5 text-purple-500" />
                )}
                {topic.isAnnouncement && (
                  <Badge variant="destructive">Annonce</Badge>
                )}
                {category && (
                  <Badge variant="outline">
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                {topic.title}
              </CardTitle>
              
              {topic.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(topic.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span>Par {topic.authorName}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(topic.createdAt!)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{topic.viewCount || 0} vues</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{topic.replyCount || 0} réponses</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          posts.map((post, index) => (
            <Card key={post.id} data-testid={`post-${post.id}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Author info */}
                  <div className="flex flex-col items-center gap-2 min-w-0 w-32">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {getInitials(post.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {post.authorName}
                      </div>
                      {post.isFirstPost && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Auteur
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>#{index + 1}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span>{formatDate(post.createdAt!)}</span>
                        {post.isEdited && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <span className="italic">Modifié</span>
                            {post.editedAt && (
                              <span>le {formatDate(post.editedAt)}</span>
                            )}
                          </>
                        )}
                      </div>
                      
                      {currentUser && (
                        <div className="flex items-center gap-1">
                          {canEditPost(post) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post)}
                              data-testid={`button-edit-post-${post.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeletePost(post) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              data-testid={`button-delete-post-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post content */}
                    {editingPost === post.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px]"
                          data-testid="textarea-edit-post"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit}
                            disabled={editPostMutation.isPending}
                            data-testid="button-save-edit"
                          >
                            {editPostMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingPost(null);
                              setEditContent("");
                            }}
                            data-testid="button-cancel-edit"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="whitespace-pre-wrap">{post.content}</p>
                      </div>
                    )}

                    {/* Post actions */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1"
                        disabled={likePostMutation.isPending}
                        data-testid={`button-like-post-${post.id}`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likeCount || 0}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply form */}
      {currentUser && !topic.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répondre au sujet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                placeholder="Écrivez votre réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[120px]"
                required
                data-testid="textarea-reply"
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Vous répondez en tant que {currentUser.name}
                </div>
                <Button 
                  type="submit" 
                  disabled={!replyContent.trim() || createPostMutation.isPending}
                  data-testid="button-submit-reply"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createPostMutation.isPending ? "Publication..." : "Publier la réponse"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!currentUser && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous devez être connecté pour participer à cette discussion.
            </p>
            <Button onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      )}

      {topic.isLocked && currentUser && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Ce sujet est verrouillé. Aucune nouvelle réponse n'est autorisée.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}