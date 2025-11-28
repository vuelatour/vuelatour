'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceDisplayProps {
  priceUSD: number | null;
  showFrom?: boolean;
  fromText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({
  priceUSD,
  showFrom = false,
  fromText = 'Desde',
  className = '',
  size = 'md',
}: PriceDisplayProps) {
  const { formatPrice, currency } = useCurrency();

  if (!priceUSD) {
    return <span className={className}>-</span>;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {showFrom && <span className="text-muted mr-1">{fromText}</span>}
      <span className="font-semibold">{formatPrice(priceUSD)}</span>
      <span className="text-xs text-muted ml-1">{currency}</span>
    </span>
  );
}
