
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { FORMAT_CURRENCY, FORMAT_DATE, CATEGORIES, UserAvatar } from '../constants';
import { ChevronLeft, Receipt, CreditCard, Filter, ArrowUpRight, ArrowDownRight, Edit3, Smartphone, Banknote, Calendar } from 'lucide-react';
import { Expense, Settlement } from '../types';

type HistoryFilter = 'all' | 'expenses' | 'settlements';

export default function HistoryScreen() {
  const { expenses, settlements, users, currentUser, setActiveTab, setEditingExpense } = useApp();
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const combinedTimeline = useMemo(() => {
    const items: (Expense | Settlement)[] = [];
    
    if (filter === 'all' || filter === 'expenses') {
      items.push(...expenses);
    }
    
    if (filter === 'all' || filter === 'settlements') {
      items.push(...settlements);
    }

    // Sort by date (descending)
    return items.sort((a, b) => {
      const dateA = 'date' in a ? new Date(a.date).getTime() : a.timestamp;
      const dateB = 'date' in b ? new Date(b.date).getTime() : b.timestamp;
      return dateB - dateA;
    });
  }, [expenses, settlements, filter]);

  const handleEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setActiveTab('add');
  };

  // Group by date for headers
  const groupedItems = useMemo(() => {
    const groups: Record<string, (Expense | Settlement)[]> = {};
    combinedTimeline.forEach(item => {
      const dateStr = 'date' in item ? FORMAT_DATE(item.date) : FORMAT_DATE(item.timestamp);
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  }, [combinedTimeline]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800">Activity History</h2>
        <div className="w-10"></div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-5 py-3 border-b border-slate-100 flex space-x-2">
        <FilterTab active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
        <FilterTab active={filter === 'expenses'} label="Expenses" onClick={() => setFilter('expenses')} />
        <FilterTab active={filter === 'settlements'} label="Settlements" onClick={() => setFilter('settlements')} />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Calendar className="w-10 h-10 text-slate-200" />
            </div>
            <div>
              <p className="font-bold text-slate-400">No activity found</p>
              <p className="text-slate-300 text-sm mt-1">Transactions will appear here once added.</p>
            </div>
          </div>
        ) : (
          (Object.entries(groupedItems) as [string, (Expense | Settlement)[]][]).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{date}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  'date' in item ? (
                    <ExpenseItem key={item.id} expense={item} onEdit={() => handleEditExpense(item)} />
                  ) : (
                    <SettlementItem key={item.id} settlement={item} />
                  )
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const FilterTab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
  >
    {label}
  </button>
);

const ExpenseItem = ({ expense, onEdit }: { expense: Expense, onEdit: () => void, key?: React.Key }) => {
  const { users, currentUser } = useApp();
  const cat = CATEGORIES.find(c => c.label === expense.category);
  const payer = users.find(u => u.id === expense.paidBy);
  const isMyExpense = expense.paidBy === currentUser?.id;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm group active:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <UserAvatar user={payer} className="w-12 h-12" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="font-bold text-sm leading-tight truncate">{expense.title}</p>
            <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 transition-opacity">
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            {cat?.label} • Paid by {isMyExpense ? 'You' : payer?.name.split(' ')[0]}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="font-black text-slate-800">{FORMAT_CURRENCY(expense.amount)}</p>
        <p className={`text-[10px] font-bold ${isMyExpense ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isMyExpense ? 'LENT' : 'OWE'}
        </p>
      </div>
    </div>
  );
};

const SettlementItem = ({ settlement }: { settlement: Settlement, key?: React.Key }) => {
  const { users, currentUser } = useApp();
  const fromUser = users.find(u => u.id === settlement.from);
  const toUser = users.find(u => u.id === settlement.to);
  const isFromMe = settlement.from === currentUser?.id;
  const isToMe = settlement.to === currentUser?.id;

  // For settlements, show the avatar of the person involved (the other person if I am involved)
  const avatarUser = isFromMe ? toUser : fromUser;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm border-l-4 border-l-emerald-400">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <UserAvatar user={avatarUser} className="w-12 h-12" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight text-slate-800">
            {isFromMe ? `You paid ${toUser?.name.split(' ')[0]}` : 
             isToMe ? `${fromUser?.name.split(' ')[0]} paid You` :
             `${fromUser?.name.split(' ')[0]} paid ${toUser?.name.split(' ')[0]}`}
          </p>
          <p className="text-emerald-600/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
            Settlement • {settlement.method}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="font-black text-emerald-600">{FORMAT_CURRENCY(settlement.amount)}</p>
        <div className="flex items-center justify-end space-x-1">
          <div className="w-3 h-3 bg-emerald-100 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          </div>
          <span className="text-[9px] font-bold text-slate-300 uppercase">Settled</span>
        </div>
      </div>
    </div>
  );
};
