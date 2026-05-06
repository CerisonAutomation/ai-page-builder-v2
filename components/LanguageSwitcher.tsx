'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const locales = [
  { code: 'en', label: 'EN', fullName: 'English' },
  { code: 'es', label: 'ES', fullName: 'Español' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = (newLocale: string) => {
    // Get current pathname from window location
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    // Replace the locale segment in the pathname
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLocale.label}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
        >
          <div className="py-1" role="none">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => handleSwitch(loc.code)}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  locale === loc.code
                    ? 'bg-violet-100 text-violet-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="font-semibold">{loc.label}</span>
                  <span className="text-gray-500">{loc.fullName}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
