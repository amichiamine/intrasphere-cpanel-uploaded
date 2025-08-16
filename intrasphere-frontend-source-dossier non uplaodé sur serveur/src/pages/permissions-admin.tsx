import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Input } from '@/core/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Search, Shield, Users, Plus, Trash2, Settings } from 'lucide-react';
import { useAuth } from '@/core/hooks/useAuth';
import { userHasPermission } from '@/shared/utils/auth';
import { API_ROUTES } from '@/shared/constants/routes';
import { PERMISSIONS, PERMISSION_GROUPS, PERMISSION_DESCRIPTIONS, ROLE_PERMISSIONS } from '@/shared/constants/permissions';
import { getRoleDisplayName } from '@/shared/utils/auth';

interface UserPermission {
  id: string;
  userId: string;
  permission: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
  isActive: boolean;
}

export default function PermissionsAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserPermissionsDialogOpen, setIsUserPermissionsDialogOpen] = useState(false);
  const [isBulkPermissionsDialogOpen, setIsBulkPermissionsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'grant' | 'revoke'>('grant');

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: [API_ROUTES.USERS],
    queryFn: () => fetch(API_ROUTES.USERS, { credentials: 'include' }).then(res => res.json())
  });

  const { data: allPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: [API_ROUTES.PERMISSIONS],
    queryFn: () => fetch(API_ROUTES.PERMISSIONS, { credentials: 'include' }).then(res => res.json())
  });

  const { data: userPermissions, isLoading: userPermissionsLoading } = useQuery({
    queryKey: [API_ROUTES.PERMISSIONS_BY_USER, selectedUser?.id],
    queryFn: () => 
      selectedUser ? 
      fetch(API_ROUTES.PERMISSIONS_BY_USER(selectedUser.id), { credentials: 'include' }).then(res => res.json()) : 
      Promise.resolve([]),
    enabled: !!selectedUser
  });

  const bulkPermissionsMutation = useMutation({
    mutationFn: (data: { userId: string; permissions: string[]; action: 'grant' | 'revoke' }) =>
      fetch(API_ROUTES.BULK_PERMISSIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PERMISSIONS] });
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PERMISSIONS_BY_USER] });
      setIsBulkPermissionsDialogOpen(false);
      setSelectedPermissions([]);
    }
  });

  const revokePermissionMutation = useMutation({
    mutationFn: (permissionId: string) =>
      fetch(`${API_ROUTES.PERMISSIONS}/${permissionId}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PERMISSIONS] });
      queryClient.invalidateQueries({ queryKey: [API_ROUTES.PERMISSIONS_BY_USER] });
    }
  });

  const handleBulkPermissions = () => {
    if (selectedUser && selectedPermissions.length > 0) {
      bulkPermissionsMutation.mutate({
        userId: selectedUser.id,
        permissions: selectedPermissions,
        action: bulkAction
      });
    }
  };

  const filteredUsers = users?.filter((u: User) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getUserPermissionsList = (userId: string): string[] => {
    const userPerms = allPermissions?.filter((p: UserPermission) => p.userId === userId) || [];
    const user = users?.find((u: User) => u.id === userId);
    const rolePerms = user ? ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [] : [];
    
    return [...new Set([...rolePerms, ...userPerms.map((p: UserPermission) => p.permission)])];
  };

  const canManagePermissions = userHasPermission(user, PERMISSIONS.MANAGE_PERMISSIONS);

  if (!canManagePermissions) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès Refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="permissions-admin-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions</h1>
          <p className="text-gray-600 mt-2">Gérez les permissions des utilisateurs et les rôles</p>
        </div>
        <Button 
          onClick={() => setIsBulkPermissionsDialogOpen(true)}
          disabled={!selectedUser}
          data-testid="button-bulk-permissions"
        >
          <Settings className="w-4 h-4 mr-2" />
          Permissions en Lot
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" data-testid="tab-users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-roles">Rôles</TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-all-permissions">Toutes les Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              data-testid="input-search-users"
            />
          </div>

          <div className="grid gap-4">
            {usersLoading ? (
              <div>Chargement des utilisateurs...</div>
            ) : (
              filteredUsers.map((user: User) => {
                const userPermsList = getUserPermissionsList(user.id);
                return (
                  <Card key={user.id} data-testid={`card-user-${user.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <CardDescription>
                            @{user.username} • {user.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Badge variant="outline">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            {userPermsList.length} permission{userPermsList.length > 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {userPermsList.slice(0, 3).map(perm => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                            {userPermsList.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{userPermsList.length - 3} autres
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserPermissionsDialogOpen(true);
                          }}
                          data-testid={`button-manage-permissions-${user.id}`}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Gérer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <Card key={role} data-testid={`card-role-${role}`}>
                <CardHeader>
                  <CardTitle>{getRoleDisplayName(role)}</CardTitle>
                  <CardDescription>
                    {permissions.length} permission{permissions.length > 1 ? 's' : ''} par défaut
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {permissions.slice(0, 10).map(perm => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                    {permissions.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{permissions.length - 10} autres
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid gap-6">
            {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
              <Card key={groupKey} data-testid={`card-permission-group-${groupKey}`}>
                <CardHeader>
                  <CardTitle>{group.label}</CardTitle>
                  <CardDescription>
                    {group.permissions.length} permission{group.permissions.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {group.permissions.map(permission => (
                      <div key={permission} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <p className="font-medium text-sm">{permission}</p>
                          <p className="text-xs text-gray-600">
                            {PERMISSION_DESCRIPTIONS[permission] || 'Description non disponible'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {allPermissions?.filter((p: UserPermission) => p.permission === permission).length || 0} utilisateurs
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Permissions Dialog */}
      <Dialog open={isUserPermissionsDialogOpen} onOpenChange={setIsUserPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Permissions de {selectedUser.name}</DialogTitle>
                <DialogDescription>
                  Gérez les permissions spécifiques pour cet utilisateur
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">
                      Rôle: {getRoleDisplayName(selectedUser.role)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsBulkPermissionsDialogOpen(true);
                      setIsUserPermissionsDialogOpen(false);
                    }}
                    data-testid="button-modify-permissions"
                  >
                    Modifier les Permissions
                  </Button>
                </div>

                {userPermissionsLoading ? (
                  <div>Chargement des permissions...</div>
                ) : (
                  <div className="space-y-4" data-testid="user-permissions-list">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Permissions du rôle</h4>
                      <div className="flex flex-wrap gap-1">
                        {ROLE_PERMISSIONS[selectedUser.role as keyof typeof ROLE_PERMISSIONS]?.map(perm => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {userPermissions?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Permissions spécifiques</h4>
                        <div className="space-y-2">
                          {userPermissions.map((perm: UserPermission) => (
                            <div key={perm.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{perm.permission}</p>
                                <p className="text-xs text-gray-600">
                                  Accordée le {new Date(perm.grantedAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => revokePermissionMutation.mutate(perm.id)}
                                data-testid={`button-revoke-${perm.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Permissions Dialog */}
      <Dialog open={isBulkPermissionsDialogOpen} onOpenChange={setIsBulkPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des Permissions en Lot</DialogTitle>
            <DialogDescription>
              {selectedUser ? `Modifier les permissions pour ${selectedUser.name}` : 'Sélectionnez un utilisateur'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="bulkAction"
                    value="grant"
                    checked={bulkAction === 'grant'}
                    onChange={(e) => setBulkAction(e.target.value as 'grant')}
                    data-testid="radio-grant-permissions"
                  />
                  <span>Accorder des permissions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="bulkAction"
                    value="revoke"
                    checked={bulkAction === 'revoke'}
                    onChange={(e) => setBulkAction(e.target.value as 'revoke')}
                    data-testid="radio-revoke-permissions"
                  />
                  <span>Révoquer des permissions</span>
                </label>
              </div>

              <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                  <div key={groupKey}>
                    <h4 className="font-medium text-gray-900 mb-2">{group.label}</h4>
                    <div className="space-y-2">
                      {group.permissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, permission]);
                              } else {
                                setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
                              }
                            }}
                            data-testid={`checkbox-permission-${permission}`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{permission}</p>
                            <p className="text-xs text-gray-600">
                              {PERMISSION_DESCRIPTIONS[permission]}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBulkPermissionsDialogOpen(false)}
                  data-testid="button-cancel-bulk-permissions"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleBulkPermissions}
                  disabled={selectedPermissions.length === 0 || bulkPermissionsMutation.isPending}
                  data-testid="button-apply-bulk-permissions"
                >
                  {bulkPermissionsMutation.isPending ? 'Application...' : 
                   `${bulkAction === 'grant' ? 'Accorder' : 'Révoquer'} ${selectedPermissions.length} permission${selectedPermissions.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}