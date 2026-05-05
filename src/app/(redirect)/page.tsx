'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n/config';

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const savedLocale = localStorage.getItem('openpot_locale');
    if (savedLocale && locales.includes(savedLocale as any)) {
      router.replace(`/${savedLocale}`);
      return;
    }

    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang as any)) {
      router.replace(`/${browserLang}`);
    } else {
      router.replace(`/${defaultLocale}`);
    }
  }, [router]);

  return null;
}
