/**
 * Role Management Page
 * Admin interface for managing roles and permissions
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleManagement } from '@/features/rbac/role-management';
import { rbacService } from '@/services/rbac.service';
import { toast } from 'sonner';

export default function RolesManagementPage() {
  const queryClient = useQueryClient();

  const { data: apiRoles } = useQuery({
    queryKey: ['rbac-roles'],
    queryFn: () => rbacService.getRoles({ includeSystemRoles: true }),
  });

  const { data: apiPermissions } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => rbacService.getPermissions(),
  });

  const fallbackRoles = [
    {
      id: 'role-1',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      type: 'system' as const,
      userCount: 5,
      permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'role.manage', 'system.config'],
      createdAt: '2026-01-01',
    },
    {
      id: 'role-2',
      name: 'Teacher',
      description: 'Can manage classes, assignments, and grades',
      type: 'system' as const,
      userCount: 45,
      permissions: ['class.read', 'assignment.manage', 'grade.manage', 'attendance.mark'],
      createdAt: '2026-01-01',
    },
    {
      id: 'role-3',
      name: 'Student',
      description: 'Can view assignments, submit work, and check grades',
      type: 'system' as const,
      userCount: 850,
      permissions: ['assignment.view', 'assignment.submit', 'grade.view', 'attendance.view'],
      createdAt: '2026-01-01',
    },
    {
      id: 'role-4',
      name: 'Parent',
      description: 'Can view child progress and communicate with teachers',
      type: 'system' as const,
      userCount: 720,
      permissions: ['child.view', 'grade.view', 'attendance.view', 'message.send'],
      createdAt: '2026-01-01',
    },
    {
      id: 'role-5',
      name: 'Department Head',
      description: 'Manages teachers and curriculum in specific department',
      type: 'custom' as const,
      userCount: 8,
      permissions: ['teacher.manage', 'curriculum.manage', 'report.view', 'class.read'],
      createdAt: '2026-02-15',
    },
    {
      id: 'role-6',
      name: 'Accountant',
      description: 'Manages fee collection and financial reporting',
      type: 'custom' as const,
      userCount: 3,
      permissions: ['fee.manage', 'payment.process', 'report.financial', 'invoice.generate'],
      createdAt: '2026-02-20',
    },
  ];

  const fallbackPermissions = [
    { id: 'user.create', name: 'Create Users', description: 'Create new user accounts', module: 'User Management' },
    { id: 'user.read', name: 'View Users', description: 'View user profiles and details', module: 'User Management' },
    { id: 'user.update', name: 'Update Users', description: 'Edit user information', module: 'User Management' },
    { id: 'user.delete', name: 'Delete Users', description: 'Remove user accounts', module: 'User Management' },
    { id: 'role.manage', name: 'Manage Roles', description: 'Create, edit, and delete roles', module: 'Role Management' },
    { id: 'role.assign', name: 'Assign Roles', description: 'Assign roles to users', module: 'Role Management' },
    { id: 'class.create', name: 'Create Classes', description: 'Create new classes', module: 'Class Management' },
    { id: 'class.read', name: 'View Classes', description: 'View class details', module: 'Class Management' },
    { id: 'class.update', name: 'Update Classes', description: 'Edit class information', module: 'Class Management' },
    { id: 'class.delete', name: 'Delete Classes', description: 'Remove classes', module: 'Class Management' },
    { id: 'teacher.manage', name: 'Manage Teachers', description: 'Full teacher management access', module: 'Teacher Management' },
    { id: 'teacher.assign', name: 'Assign Teachers', description: 'Assign teachers to classes', module: 'Teacher Management' },
    { id: 'assignment.manage', name: 'Manage Assignments', description: 'Create, edit, delete assignments', module: 'Assignments' },
    { id: 'assignment.view', name: 'View Assignments', description: 'View assignment details', module: 'Assignments' },
    { id: 'assignment.submit', name: 'Submit Assignments', description: 'Submit assignment work', module: 'Assignments' },
    { id: 'grade.manage', name: 'Manage Grades', description: 'Enter and edit grades', module: 'Grades' },
    { id: 'grade.view', name: 'View Grades', description: 'View grade information', module: 'Grades' },
    { id: 'grade.approve', name: 'Approve Grades', description: 'Approve and publish grades', module: 'Grades' },
    { id: 'attendance.mark', name: 'Mark Attendance', description: 'Mark student attendance', module: 'Attendance' },
    { id: 'attendance.view', name: 'View Attendance', description: 'View attendance records', module: 'Attendance' },
    { id: 'attendance.report', name: 'Attendance Reports', description: 'Generate attendance reports', module: 'Attendance' },
    { id: 'fee.manage', name: 'Manage Fees', description: 'Create fee structures', module: 'Fee Management' },
    { id: 'payment.process', name: 'Process Payments', description: 'Record fee payments', module: 'Fee Management' },
    { id: 'invoice.generate', name: 'Generate Invoices', description: 'Create fee invoices', module: 'Fee Management' },
    { id: 'report.view', name: 'View Reports', description: 'Access general reports', module: 'Reporting' },
    { id: 'report.financial', name: 'Financial Reports', description: 'Access financial reports', module: 'Reporting' },
    { id: 'report.academic', name: 'Academic Reports', description: 'Access academic reports', module: 'Reporting' },
    { id: 'curriculum.manage', name: 'Manage Curriculum', description: 'Create and edit curriculum', module: 'Curriculum' },
    { id: 'curriculum.view', name: 'View Curriculum', description: 'View curriculum details', module: 'Curriculum' },
    { id: 'message.send', name: 'Send Messages', description: 'Send messages to users', module: 'Communication' },
    { id: 'message.broadcast', name: 'Broadcast Messages', description: 'Send bulk messages', module: 'Communication' },
    { id: 'system.config', name: 'System Configuration', description: 'Configure system settings', module: 'System' },
    { id: 'system.backup', name: 'System Backup', description: 'Create system backups', module: 'System' },
    { id: 'child.view', name: 'View Child Data', description: 'View child information', module: 'Parent Portal' },
    { id: 'child.fees', name: 'Pay Child Fees', description: 'Pay fees for children', module: 'Parent Portal' },
  ];

  const roles = Array.isArray(apiRoles) && apiRoles.length > 0
    ? apiRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        type: r.isSystemRole ? ('system' as const) : ('custom' as const),
        userCount: r.userCount || 0,
        permissions: r.permissions?.map((p) => p.code || p.id) || [],
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
      }))
    : fallbackRoles;

  const permissions = Array.isArray(apiPermissions) && apiPermissions.length > 0
    ? apiPermissions.map((p) => ({
        id: p.code || p.id,
        name: p.name,
        description: p.description || '',
        module: p.module || p.resource || 'General',
      }))
    : fallbackPermissions;

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => rbacService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Role created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => rbacService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update role');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rbacService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete role');
    },
  });

  const handleCreateRole = async (data: any) => {
    createRoleMutation.mutate({
      name: data.name,
      code: data.name.toUpperCase().replace(/\s+/g, '_'),
      description: data.description,
      level: 1,
      permissionIds: data.permissions || [],
    });
  };

  const handleUpdateRole = async (id: string, data: any) => {
    updateRoleMutation.mutate({
      id,
      data: {
        name: data.name,
        description: data.description,
        permissionIds: data.permissions || [],
      },
    });
  };

  const handleDeleteRole = async (id: string) => {
    deleteRoleMutation.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <RoleManagement
        roles={roles}
        permissions={permissions}
        onCreateRole={handleCreateRole}
        onUpdateRole={handleUpdateRole}
        onDeleteRole={handleDeleteRole}
      />
    </div>
  );
}
