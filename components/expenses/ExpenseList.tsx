'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  LKR: 'Rs',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
  CNY: '¥',
};

export function useCurrency() {
  const { data: session } = useSession();
  const [currency, setCurrency] = useState('LKR');
  const [symbol, setSymbol] = useState('Rs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          const userCurrency = data.currency || 'LKR';
          setCurrency(userCurrency);
          setSymbol(CURRENCY_SYMBOLS[userCurrency] || 'Rs');
        }
      } catch (error) {
        console.error('Error fetching currency settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [session]);

  const formatAmount = (amount: number): string => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  return { currency, symbol, formatAmount, loading };
}