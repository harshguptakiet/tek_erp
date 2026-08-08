/**
 * RBAC Hooks
 * React Query hooks for role and permission management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rbacService, type CreateRoleDto, type UpdateRoleDto } from '../../services/rbac.service';
import { toast } from 'sonner';

export function useRoles(includeSystemRoles = false) {
  return useQuery({
    queryKey: ['roles', includeSystemRoles],
    queryFn: () => rbacService.getRoles({ includeSystemRoles }),
  });
}

export function useRoleById(roleId: string) {
  return useQuery({
    queryKey: ['role', roleId],
    queryFn: () => rbacService.getRoleById(roleId),
    enabled: !!roleId,
  });
}

export function usePermissions(filters?: { module?: string; resource?: string }) {
  return useQuery({
    queryKey: ['permissions', filters],
    queryFn: () => rbacService.getPermissions(filters),
  });
}

export function usePermissionsByModule() {
  return useQuery({
    queryKey: ['permissions-by-module'],
    queryFn: () => rbacService.getPermissionsByModule(),
  });
}

export function useUsersByRole(roleId: string) {
  return useQuery({
    queryKey: ['users-by-role', roleId],
    queryFn: () => rbacService.getUsersByRole(roleId),
    enabled: !!roleId,
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => rbacService.getUserPermissions(userId),
    enabled: !!userId,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => rbacService.createRole(data),
    onSuccess: () => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleDto }) =>
      rbacService.updateRole(roleId, data),
    onSuccess: () => {
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => rbacService.deleteRole(roleId),
    onSuccess: () => {
      toast.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      rbacService.assignRoleToUser(userId, roleId),
    onSuccess: () => {
      toast.success('Role assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['users-by-role'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign role');
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => rbacService.removeRoleFromUser(userId),
    onSuccess: () => {
      toast.success('Role removed successfully');
      queryClient.invalidateQueries({ queryKey: ['users-by-role'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove role');
    },
  });
}

export function useCloneRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, newName }: { roleId: string; newName: string }) =>
      rbacService.cloneRole(roleId, newName),
    onSuccess: () => {
      toast.success('Role cloned successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clone role');
    },
  });
}

export function useCheckPermission(resource: string, action: string) {
  return useQuery({
    queryKey: ['check-permission', resource, action],
    queryFn: () => rbacService.checkPermission(resource, action),
    enabled: !!resource && !!action,
  });
}
