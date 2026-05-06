'use client';

/**
 * Forgot Password Form Component
 * ✅ Password reset with Supabase Auth and sonner toasts
 */

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/db/supabase';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [sent, setSent] = useState(false);
  const t = useTranslations('Auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: { email?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field === 'email') {
          fieldErrors.email = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success(t('resetEmailSent'));
      }
    } catch (err) {
      toast.error(t('resetEmailError'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{t('resetEmailSentDescription')}</p>
        </div>
        <a
          href="/login"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {t('backToLogin')}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('emailPlaceholder')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('sending') : t('sendResetLink')}
      </button>

      <p className="text-center text-sm text-slate-600">
        <a href="/login" className="text-blue-600 hover:text-blue-500">
          {t('backToLogin')}
        </a>
      </p>
    </form>
  );
}
