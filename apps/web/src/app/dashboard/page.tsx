'use client';

import { useAuthStore } from '../../stores/auth.store';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.firstName} {user.lastName}!
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Role</h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">{user.role}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Email</h3>
            <p className="mt-2 text-sm text-gray-600">{user.email}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {user.permissions.length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="mt-2 text-gray-600">
            Feature modules will be added here (Students, Teachers, Attendance, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
