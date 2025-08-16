import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/core/components/ui/form';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Event } from '@shared/schema';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import { useAuth } from '@/core/hooks/useAuth';
import { userHasPermission } from '@/shared/utils/auth';
import { API_ROUTES } from '@/shared/constants/routes';
import { PERMISSIONS } from '@/shared/constants/permissions';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  location: z.string().optional(),
  maxParticipants: z.number().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  isPrivate: z.boolean().default(false)
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function Events() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: [API_ROUTES.EVENTS],
    queryFn: () => fetch(API_ROUTES.EVENTS, { credentials: 'include' }).then(res => res.json())
  });

  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => 
      fetch(API_ROUTES.EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          allDay: false,
          organizer: user?.id
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.EVENTS] });
      setIsCreateDialogOpen(false);
      form.reset();
    }
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      category: 'general',
      isPrivate: false
    }
  });

  const handleCreateEvent = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const canCreateEvents = userHasPermission(user, PERMISSIONS.CREATE_EVENTS);

  const getEventTypeColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      training: 'bg-purple-100 text-purple-800',
      social: 'bg-pink-100 text-pink-800',
      important: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="events-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-2">Découvrez les événements à venir et passés</p>
        </div>
        {canCreateEvents && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Événement
          </Button>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events?.map((event: Event) => (
          <Card 
            key={event.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setSelectedEvent(event);
              setIsDetailsDialogOpen(true);
            }}
            data-testid={`card-event-${event.id}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {event.description}
                  </CardDescription>
                </div>
                <Badge className={getEventTypeColor(event.category)}>
                  {event.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(event.startDate).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(event.endDate).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.maxParticipants && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Max {event.maxParticipants} participants</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier événement.</p>
          {canCreateEvents && (
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Événement
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un Nouvel Événement</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouvel événement.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateEvent)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom de l'événement" 
                        {...field} 
                        data-testid="input-event-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez l'événement..." 
                        {...field} 
                        data-testid="input-event-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début*</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-event-start-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin*</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-event-end-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Lieu de l'événement" 
                        {...field} 
                        data-testid="input-event-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie*</FormLabel>
                      <FormControl>
                        <select 
                          {...field} 
                          className="w-full p-2 border rounded-md"
                          data-testid="select-event-category"
                        >
                          <option value="general">Général</option>
                          <option value="meeting">Réunion</option>
                          <option value="training">Formation</option>
                          <option value="social">Social</option>
                          <option value="important">Important</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Illimité" 
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-event-max-participants"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-event"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending}
                  data-testid="button-submit-event"
                >
                  {createEventMutation.isPending ? 'Création...' : 'Créer l\'Événement'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <Badge className={getEventTypeColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                </div>
                <DialogDescription>
                  Détails de l'événement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4" data-testid="event-details">
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900">Date et heure</h4>
                  <div className="text-gray-600 mt-1">
                    <p>Début: {formatDateTime(selectedEvent.startDate)}</p>
                    <p>Fin: {formatDateTime(selectedEvent.endDate)}</p>
                  </div>
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <h4 className="font-medium text-gray-900">Lieu</h4>
                    <p className="text-gray-600 mt-1">{selectedEvent.location}</p>
                  </div>
                )}
                
                {selectedEvent.maxParticipants && (
                  <div>
                    <h4 className="font-medium text-gray-900">Participants</h4>
                    <p className="text-gray-600 mt-1">Maximum {selectedEvent.maxParticipants} participants</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}