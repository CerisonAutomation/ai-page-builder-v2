/**
 * Forgot Password Page
 * ✅ Password reset request with Supabase Auth
 */

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('forgotPassword')}</h1>
          <p className="text-slate-600 mt-2">{t('forgotPasswordDescription')}</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
