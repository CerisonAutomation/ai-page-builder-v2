'use client';

/**
 * RoleGuard Component
 * ✅ Client-side role-based conditional rendering
 */

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/db/supabase';
import { getUserRole, hasRole, UserRole } from '@/lib/auth/roles';
import { useTranslations } from 'next-intl';

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Auth');

  useEffect(() => {
    async function checkRole() {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      const role = await getUserRole(supabase, user.id);
      setUserRole(role);
      setLoading(false);
    }

    checkRole();
  }, []);

  if (loading) {
    return <div className="animate-pulse">{t('checkingPermissions')}...</div>;
  }

  if (!hasRole(userRole, role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
