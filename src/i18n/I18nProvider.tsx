'use client';

import React, { createContext, useContext } from 'react';
import type { Dictionary } from './config';

interface I18nContextType {
  dict: Dictionary;
  locale: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({
  children,
  dict,
  locale,
}: {
  children: React.ReactNode;
  dict: Dictionary;
  locale: string;
}) => {
  return (
    <I18nContext.Provider value={{ dict, locale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  // Helper to safely access nested dictionary keys like 'landing.title'
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = context.dict;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if translation is missing
      }
    }
    return typeof value === 'string' ? value : key;
  };

  return { t, locale: context.locale };
};
