/**
 * Admin Dashboard
 * ✅ Admin-only dashboard with full system access
 */

import { getCurrentUser } from '@/lib/auth/middleware';
import { UserRole } from '@/lib/auth/roles';
import RoleBadge from '@/components/auth/RoleBadge';
import { useTranslations } from 'next-intl';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/unauthorized');
  }

  const t = useTranslations('Dashboard');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('adminDashboard')}</h1>
          <RoleBadge role={user.role} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-slate-900">{t('totalUsers')}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-slate-900">{t('totalPages')}</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-slate-900">{t('activeSessions')}</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('adminActions')}</h2>
          <div className="space-y-4">
            <a href="/admin/pages" className="block p-4 border rounded hover:bg-slate-50">
              {t('managePages')}
            </a>
            <a href="/admin/media" className="block p-4 border rounded hover:bg-slate-50">
              {t('manageMedia')}
            </a>
            <a href="/admin/plugins" className="block p-4 border rounded hover:bg-slate-50">
              {t('managePlugins')}
            </a>
            <a href="/admin/settings" className="block p-4 border rounded hover:bg-slate-50">
              {t('manageSettings')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
