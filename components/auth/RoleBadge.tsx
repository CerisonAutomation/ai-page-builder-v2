'use client';

/**
 * RoleBadge Component
 * ✅ Visual badge showing user's role with color coding
 */

import { UserRole } from '@/lib/auth/roles';
import { useTranslations } from 'next-intl';

interface RoleBadgeProps {
  role: UserRole;
  showLabel?: boolean;
}

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  owner: 'bg-blue-100 text-blue-800 border-blue-200',
  guest: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function RoleBadge({ role, showLabel = true }: RoleBadgeProps) {
  const t = useTranslations('Auth');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[role]}`}
    >
      {showLabel && t(`role${role.charAt(0).toUpperCase() + role.slice(1)}`)}
    </span>
  );
}
