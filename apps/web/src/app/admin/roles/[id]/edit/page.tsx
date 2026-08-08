/**
 * Edit Role Page
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoleById, useUpdateRole, usePermissionsByModule } from '@/features/rbac/use-rbac';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const roleSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  level: z.number().min(1).max(100),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const { data: role } = useRoleById(roleId);
  const { data: permissionsByModule } = usePermissionsByModule();
  const updateRoleMutation = useUpdateRole();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || '',
        level: role.level,
      });
      setSelectedPermissions(role.permissions.map(p => p.id));
    }
  }, [role, reset]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]
    );
  };

  const onSubmit = async (data: RoleFormData) => {
    await updateRoleMutation.mutateAsync({
      roleId,
      data: { ...data, permissionIds: selectedPermissions },
    });
    router.push('/admin/roles');
  };

  if (!role) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Role: {role.name}</h1>
        <p className="text-muted-foreground">Modify role permissions and details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Role Name *</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Level *</label>
            <Input type="number" {...register('level', { valueAsNumber: true })} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea {...register('description')} rows={3} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Permissions ({selectedPermissions.length} selected)</h3>
          {permissionsByModule && Object.entries(permissionsByModule).map(([module, permissions]) => (
            <div key={module} className="mb-6">
              <h4 className="font-semibold mb-2">{module}</h4>
              <div className="ml-4 grid grid-cols-2 gap-2">
                {permissions.map((permission: any) => (
                  <label key={permission.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="rounded"
                    />
                    {permission.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={updateRoleMutation.isPending}>
            {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
