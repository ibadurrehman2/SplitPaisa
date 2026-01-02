
export type Category = 'Food' | 'Rent' | 'Travel' | 'Bills' | 'Shopping' | 'Others';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'Trip' | 'Home' | 'Office' | 'Others';
  members: string[]; // User IDs
  createdAt: number;
}

export interface SplitMember {
  userId: string;
  amount: number;
  share?: number; // For share-based splitting
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  date: string;
  category: Category;
  paidBy: string; // User ID
  splits: SplitMember[];
  notes?: string;
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  method: 'UPI' | 'Cash' | 'Bank';
  timestamp: number;
  groupId?: string;
}

export interface Balance {
  userId: string;
  amount: number; // Positive means user is owed, negative means user owes
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: 'expense' | 'settlement' | 'group';
  read: boolean;
  fromUserId?: string; // New field for avatar consistency
}
