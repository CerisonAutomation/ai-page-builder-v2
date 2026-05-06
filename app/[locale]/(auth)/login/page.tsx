/**
 * Login Page
 * ✅ Email/password login with Supabase Auth
 */

import LoginForm from '@/components/auth/LoginForm';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('login')}</h1>
          <p className="text-slate-600 mt-2">{t('loginDescription')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
