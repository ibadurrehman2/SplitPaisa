
import React from 'react';
import { Utensils, Home, Car, Receipt, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: 'Food', icon: <Utensils className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
  { label: 'Rent', icon: <Home className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  { label: 'Travel', icon: <Car className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
  { label: 'Bills', icon: <Receipt className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600' },
  { label: 'Shopping', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600' },
  { label: 'Others', icon: <MoreHorizontal className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600' },
];

export const FORMAT_CURRENCY = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const FORMAT_DATE = (timestamp: string | number) => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
};
