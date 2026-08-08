/**
 * Create Role Page
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRole, usePermissionsByModule } from '@/features/rbac/use-rbac';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const roleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').regex(/^[A-Z_]+$/, 'Code must be uppercase with underscores'),
  description: z.string().optional(),
  level: z.number().min(1).max(100),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function CreateRolePage() {
  const router = useRouter();
  const { data: permissionsByModule } = usePermissionsByModule();
  const createRoleMutation = useCreateRole();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { level: 50 },
  });

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModule = (modulePermissions: any[]) => {
    const moduleIds = modulePermissions.map(p => p.id);
    const allSelected = moduleIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...moduleIds])]);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    await createRoleMutation.mutateAsync({
      ...data,
      permissionIds: selectedPermissions,
    });
    router.push('/admin/roles');
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Role</h1>
        <p className="text-muted-foreground">Define a new role with specific permissions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Basic Information</h3>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Role Name *</label>
            <Input {...register('name')} placeholder="e.g., Department Head" />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Role Code *</label>
            <Input {...register('code')} placeholder="e.g., DEPT_HEAD" />
            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Level (1-100) *</label>
            <Input type="number" {...register('level', { valueAsNumber: true })} />
            {errors.level && <p className="text-sm text-red-500 mt-1">{errors.level.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea {...register('description')} rows={3} placeholder="Describe this role's responsibilities..." />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Permissions ({selectedPermissions.length} selected)</h3>
          
          {permissionsByModule && Object.entries(permissionsByModule).map(([module, permissions]) => (
            <div key={module} className="mb-6 last:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={permissions.every((p: any) => selectedPermissions.includes(p.id))}
                  onChange={() => toggleModule(permissions)}
                  className="rounded"
                />
                <h4 className="font-semibold">{module}</h4>
                <span className="text-sm text-muted-foreground">({permissions.length} permissions)</span>
              </div>
              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissions.map((permission: any) => (
                  <label key={permission.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="rounded"
                    />
                    <span>{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createRoleMutation.isPending || selectedPermissions.length === 0}>
            {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  );
}
