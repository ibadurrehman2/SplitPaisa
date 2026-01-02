
import React from 'react';
import { Utensils, Home, Car, Receipt, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { Category, User } from './types';

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

// Reusable Avatar component for consistency across the app
export const UserAvatar = ({ user, className = "w-10 h-10", textClass = "text-xs" }: { user?: User, className?: string, textClass?: string }) => {
  if (!user) return <div className={`${className} bg-slate-200 rounded-full`} />;
  
  if (user.avatar && !user.avatar.includes('picsum.photos')) {
    return <img src={user.avatar} className={`${className} rounded-full object-cover border border-slate-100 shadow-sm`} alt={user.name} />;
  }

  // Generate initials
  const initials = user.name
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color based on name
  const bgColors = ['bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-sky-500', 'bg-pink-500'];
  const charCodeSum = user.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const bgColor = bgColors[charCodeSum % bgColors.length];

  return (
    <div className={`${className} ${bgColor} rounded-full flex items-center justify-center text-white font-bold tracking-tight shadow-sm border border-white/20 ${textClass}`}>
      {initials}
    </div>
  );
};
