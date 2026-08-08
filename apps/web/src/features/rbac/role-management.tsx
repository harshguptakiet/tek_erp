/**
 * Role Management Component
 * Create, edit, and manage roles and permissions
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Lock,
  Unlock,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  userCount: number;
  permissions: string[];
  createdAt: string;
}

interface RoleManagementProps {
  roles: Role[];
  permissions: Permission[];
  onCreateRole: (data: Partial<Role>) => Promise<void>;
  onUpdateRole: (id: string, data: Partial<Role>) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
}

export function RoleManagement({
  roles,
  permissions,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: RoleManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const modules = Object.keys(permissionsByModule);

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.type === 'system') {
      toast.error('System roles cannot be deleted');
      return;
    }

    if (role.userCount > 0) {
      if (!confirm(`This role has ${role.userCount} users. Are you sure you want to delete it?`)) {
        return;
      }
    }

    await onDeleteRole(role.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Role Management
          </h1>
          <p className="text-muted-foreground">Manage roles and permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Total Roles: {roles.length}</Badge>
            <Badge variant="outline">System: {roles.filter((r) => r.type === 'system').length}</Badge>
            <Badge variant="outline">Custom: {roles.filter((r) => r.type === 'custom').length}</Badge>
          </div>
        </div>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{role.name}</h3>
                    {role.type === 'system' && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{role.userCount} users</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{role.permissions.length} permissions</span>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permId) => {
                    const perm = permissions.find((p) => p.id === permId);
                    return perm ? (
                      <Badge key={permId} variant="secondary" className="text-xs">
                        {perm.name}
                      </Badge>
                    ) : null;
                  })}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={role.type === 'system'}
                  onClick={() => handleDeleteRole(role)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No roles found matching your search.</p>
        </Card>
      )}

      {/* Create/Edit Role Modal */}
      <RoleFormModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        permissions={permissions}
        permissionsByModule={permissionsByModule}
        modules={modules}
        onSubmit={async (data) => {
          if (selectedRole) {
            await onUpdateRole(selectedRole.id, data);
          } else {
            await onCreateRole(data);
          }
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
}

// Role Form Modal Component
interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  permissions: Permission[];
  permissionsByModule: Record<string, Permission[]>;
  modules: string[];
  onSubmit: (data: Partial<Role>) => Promise<void>;
}

function RoleFormModal({
  isOpen,
  onClose,
  role,
  permissions,
  permissionsByModule,
  modules,
  onSubmit,
}: RoleFormModalProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: new Set(role?.permissions || []),
  });
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (permId: string) => {
    const newPerms = new Set(formData.permissions);
    if (newPerms.has(permId)) {
      newPerms.delete(permId);
    } else {
      newPerms.add(permId);
    }
    setFormData({ ...formData, permissions: newPerms });
  };

  const toggleAllModulePermissions = (module: string) => {
    const modulePerms = permissionsByModule[module].map((p) => p.id);
    const allSelected = modulePerms.every((id) => formData.permissions.has(id));
    
    const newPerms = new Set(formData.permissions);
    if (allSelected) {
      modulePerms.forEach((id) => newPerms.delete(id));
    } else {
      modulePerms.forEach((id) => newPerms.add(id));
    }
    setFormData({ ...formData, permissions: newPerms });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (formData.permissions.size === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        permissions: Array.from(formData.permissions),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label>Role Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Department Head"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this role can do..."
                rows={2}
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base">Permissions</Label>
              <Badge variant="outline">{formData.permissions.size} selected</Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-3">
              {modules.map((module) => {
                const modulePerms = permissionsByModule[module];
                const selectedCount = modulePerms.filter((p) => formData.permissions.has(p.id)).length;
                const allSelected = selectedCount === modulePerms.length;

                return (
                  <div key={module} className="border rounded-lg">
                    <div
                      className="flex items-center justify-between p-3 bg-muted cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleModule(module)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedModules.has(module) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{module}</span>
                        <Badge variant="secondary" className="text-xs">
                          {selectedCount}/{modulePerms.length}
                        </Badge>
                      </div>
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleAllModulePermissions(module)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {expandedModules.has(module) && (
                      <div className="p-3 space-y-2">
                        {modulePerms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded"
                          >
                            <Checkbox
                              checked={formData.permissions.has(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{permission.name}</p>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
