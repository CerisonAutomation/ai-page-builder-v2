/**
 * Register Page
 * ✅ User registration with role selection
 */

import RegisterForm from '@/components/auth/RegisterForm';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('register')}</h1>
          <p className="text-slate-600 mt-2">{t('registerDescription')}</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
