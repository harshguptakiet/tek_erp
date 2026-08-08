/**
 * RBAC (Role-Based Access Control) Service
 * Handles roles and permissions management
 */

import { apiClient } from '../lib/axios';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  level: number;
  isSystemRole: boolean;
  permissions: Permission[];
  userCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
  module: string;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  level: number;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
}

export interface UserRole {
  userId: string;
  userName: string;
  email: string;
  roleId: string;
  roleName: string;
  assignedAt: Date;
  assignedBy?: string;
}

export const rbacService = {
  /**
   * Get all roles
   */
  async getRoles(params?: {
    includeSystemRoles?: boolean;
  }) {
    const response = await apiClient.get<Role[]>('/rbac/roles', { params });
    return response.data;
  },

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string) {
    const response = await apiClient.get<Role>(`/rbac/roles/${roleId}`);
    return response.data;
  },

  /**
   * Create new role
   */
  async createRole(data: CreateRoleDto) {
    const response = await apiClient.post<Role>('/rbac/roles', data);
    return response.data;
  },

  /**
   * Update role
   */
  async updateRole(roleId: string, data: UpdateRoleDto) {
    const response = await apiClient.patch<Role>(`/rbac/roles/${roleId}`, data);
    return response.data;
  },

  /**
   * Delete role
   */
  async deleteRole(roleId: string) {
    const response = await apiClient.delete(`/rbac/roles/${roleId}`);
    return response.data;
  },

  /**
   * Get all permissions
   */
  async getPermissions(params?: {
    module?: string;
    resource?: string;
  }) {
    const response = await apiClient.get<Permission[]>('/rbac/permissions', { params });
    return response.data;
  },

  /**
   * Get permissions grouped by module
   */
  async getPermissionsByModule() {
    const response = await apiClient.get<Record<string, Permission[]>>('/rbac/permissions/by-module');
    return response.data;
  },

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string) {
    const response = await apiClient.post('/rbac/assign', { userId, roleId });
    return response.data;
  },

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string) {
    const response = await apiClient.delete(`/rbac/assign/${userId}`);
    return response.data;
  },

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string) {
    const response = await apiClient.get<UserRole[]>(`/rbac/roles/${roleId}/users`);
    return response.data;
  },

  /**
   * Get user's permissions
   */
  async getUserPermissions(userId: string) {
    const response = await apiClient.get<Permission[]>(`/rbac/users/${userId}/permissions`);
    return response.data;
  },

  /**
   * Check if user has permission
   */
  async checkPermission(resource: string, action: string) {
    const response = await apiClient.get<{ hasPermission: boolean }>(
      '/rbac/check-permission',
      { params: { resource, action } }
    );
    return response.data.hasPermission;
  },

  /**
   * Clone role (copy with new name)
   */
  async cloneRole(roleId: string, newName: string) {
    const response = await apiClient.post<Role>(`/rbac/roles/${roleId}/clone`, { newName });
    return response.data;
  },
};
