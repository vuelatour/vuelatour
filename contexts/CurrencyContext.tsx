'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type Currency = 'MXN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar moneda del sitio desde Supabase
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'site_currency')
          .single();

        if (data && (data.value === 'MXN' || data.value === 'USD')) {
          setCurrency(data.value as Currency);
        }
      } catch (error) {
        console.error('Error loading currency setting:', error);
      }

      setIsHydrated(true);
    };

    loadCurrency();
  }, []);

  const formatPrice = (price: number): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } else {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }
  };

  // Evitar hidratación mismatch
  if (!isHydrated) {
    return (
      <CurrencyContext.Provider
        value={{
          currency: 'USD',
          formatPrice: (price: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(price),
        }}
      >
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
