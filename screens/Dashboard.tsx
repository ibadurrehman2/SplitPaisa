
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { calculateNetBalances, simplifyDebts } from '../utils/settlementEngine';
import { FORMAT_CURRENCY, FORMAT_DATE, CATEGORIES, UserAvatar } from '../constants';
import { 
  TrendingUp, TrendingDown, Bell, Search, Filter, 
  ArrowUpRight, ArrowDownRight, Edit3, X, Check,
  Calendar, ArrowUpDown, ListFilter, RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Category } from '../types';

type SortOption = 'date-desc' | 'amount-desc' | 'amount-asc';
type TimeOption = 'all' | 'week' | 'month';

export default function Dashboard() {
  const { currentUser, users, expenses, settlements, notifications, setEditingExpense, setActiveTab } = useApp();
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [timePeriod, setTimePeriod] = useState<TimeOption>('all');

  const balances = calculateNetBalances(users, expenses, settlements);
  const myBalance = balances[currentUser!.id] || 0;
  const debts = simplifyDebts(balances);
  
  const peopleWhoOweMe = debts.filter(d => d.to === currentUser!.id);
  const peopleIOwe = debts.filter(d => d.from === currentUser!.id);

  const totalOwed = peopleWhoOweMe.reduce((acc, d) => acc + d.amount, 0);
  const totalIOwe = peopleIOwe.reduce((acc, d) => acc + d.amount, 0);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleEditExpense = (exp: any) => {
    setEditingExpense(exp);
    setActiveTab('add');
  };

  const handleSettleUp = () => {
    setActiveTab('settle');
  };

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // 1. Filter by Time Period
    const now = new Date();
    if (timePeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(e => new Date(e.date) >= weekAgo);
    } else if (timePeriod === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      result = result.filter(e => new Date(e.date) >= monthAgo);
    }

    // 2. Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(e => e.category === selectedCategory);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result.slice(0, 20);
  }, [expenses, selectedCategory, sortBy, timePeriod]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSortBy('date-desc');
    setTimePeriod('all');
  };

  const hasActiveFilters = selectedCategory !== 'All' || sortBy !== 'date-desc' || timePeriod !== 'all';

  return (
    <div className="p-5 space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hello, {currentUser?.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 text-sm">Your expense overview</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('search')}
            className="p-2 bg-white rounded-full shadow-sm border border-slate-100"
          >
            <Search className="w-5 h-5 text-slate-500" />
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className="p-2 bg-white rounded-full shadow-sm border border-slate-100 relative"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
        <div className="space-y-1">
          <span className="text-indigo-100 text-sm font-medium">Total Balance</span>
          <h3 className="text-3xl font-bold">{FORMAT_CURRENCY(myBalance)}</h3>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-4 rounded-2xl flex flex-col">
            <div className="flex items-center space-x-1 text-indigo-100 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>You are owed</span>
            </div>
            <span className="text-lg font-bold">{FORMAT_CURRENCY(totalOwed)}</span>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl flex flex-col">
            <div className="flex items-center space-x-1 text-indigo-100 text-xs mb-1">
              <TrendingDown className="w-3 h-3" />
              <span>You owe</span>
            </div>
            <span className="text-lg font-bold">{FORMAT_CURRENCY(totalIOwe)}</span>
          </div>
        </div>
      </div>

      {/* Quick Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">Balance Breakdown</h4>
          <button onClick={() => setActiveTab('allBalances')} className="text-indigo-600 text-sm font-semibold">See all</button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {peopleWhoOweMe.length === 0 && peopleIOwe.length === 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
              <p className="text-slate-500 font-medium">All settled up! ✨</p>
            </div>
          )}
          
          {peopleWhoOweMe.slice(0, 3).map((debt, idx) => {
            const user = users.find(u => u.id === debt.from);
            return (
              <div key={`oweme-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm group active:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={user} className="w-10 h-10" />
                  <div>
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-emerald-600 text-[11px] font-bold uppercase">Owes you</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                   <div className="text-right">
                    <p className="font-bold text-slate-700">{FORMAT_CURRENCY(debt.amount)}</p>
                  </div>
                  <button 
                    onClick={handleSettleUp}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {peopleIOwe.slice(0, 3).map((debt, idx) => {
            const user = users.find(u => u.id === debt.to);
            return (
              <div key={`iowe-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm group active:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={user} className="w-10 h-10" />
                  <div>
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-rose-600 text-[11px] font-bold uppercase">You owe</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-bold text-slate-700">{FORMAT_CURRENCY(debt.amount)}</p>
                  </div>
                  <button 
                    onClick={handleSettleUp}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                  >
                    Settle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">Recent Expenses</h4>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="flex items-center space-x-1 text-rose-500 bg-rose-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center space-x-1 p-2 rounded-xl border transition-colors ${hasActiveFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Filter</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
             <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <ListFilter className="w-8 h-8" />
               </div>
               <div>
                <p className="text-slate-400 text-sm font-bold">No expenses found</p>
                <p className="text-slate-300 text-xs mt-1 px-8">Try changing your filters to see more activity.</p>
               </div>
               {hasActiveFilters && (
                 <button 
                  onClick={resetFilters}
                  className="text-indigo-600 text-xs font-bold uppercase tracking-widest"
                 >
                   Clear All Filters
                 </button>
               )}
             </div>
          ) : (
            filteredExpenses.map(exp => {
              const cat = CATEGORIES.find(c => c.label === exp.category);
              const payer = users.find(u => u.id === exp.paidBy);
              const isMyExpense = exp.paidBy === currentUser?.id;
              
              return (
                <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm group active:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl shrink-0 ${cat?.color || 'bg-slate-100 text-slate-500'}`}>
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-sm leading-tight truncate">{exp.title}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditExpense(exp);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-indigo-600"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 truncate">Paid by {payer?.name.split(' ')[0]} • {FORMAT_DATE(exp.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-bold text-slate-800">{FORMAT_CURRENCY(exp.amount)}</p>
                    <p className={`text-[10px] font-bold ${isMyExpense ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isMyExpense ? 'LENT' : 'OWE'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- Filter Bottom Sheet Overlay --- */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
            onClick={() => setIsFilterOpen(false)} 
          />
          <div className="bg-white rounded-t-[40px] shadow-2xl relative z-10 p-8 space-y-8 animate-in slide-in-from-bottom-full duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">Filter Expenses</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-400">
                <ListFilter className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">By Category</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip 
                  label="All" 
                  active={selectedCategory === 'All'} 
                  onClick={() => setSelectedCategory('All')} 
                />
                {CATEGORIES.map(cat => (
                  <FilterChip 
                    key={cat.label}
                    label={cat.label} 
                    icon={cat.icon}
                    active={selectedCategory === cat.label} 
                    onClick={() => setSelectedCategory(cat.label)} 
                  />
                ))}
              </div>
            </div>

            {/* Sort Order Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-400">
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sort By</span>
              </div>
              <div className="flex gap-2">
                <FilterChip 
                  label="Newest First" 
                  active={sortBy === 'date-desc'} 
                  onClick={() => setSortBy('date-desc')} 
                />
                <FilterChip 
                  label="Highest Amount" 
                  active={sortBy === 'amount-desc'} 
                  onClick={() => setSortBy('amount-desc')} 
                />
                <FilterChip 
                  label="Lowest Amount" 
                  active={sortBy === 'amount-asc'} 
                  onClick={() => setSortBy('amount-asc')} 
                />
              </div>
            </div>

            {/* Time Period Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Time Period</span>
              </div>
              <div className="flex gap-2">
                <FilterChip 
                  label="All Time" 
                  active={timePeriod === 'all'} 
                  onClick={() => setTimePeriod('all')} 
                />
                <FilterChip 
                  label="This Week" 
                  active={timePeriod === 'week'} 
                  onClick={() => setTimePeriod('week')} 
                />
                <FilterChip 
                  label="This Month" 
                  active={timePeriod === 'month'} 
                  onClick={() => setTimePeriod('month')} 
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={resetFilters}
                className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-3xl font-bold text-sm active:bg-slate-100 transition-colors"
              >
                Reset All
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="flex-[2] bg-indigo-600 text-white py-4 rounded-3xl font-bold text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-transform"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterChip = ({ label, icon, active, onClick }: { label: string, icon?: React.ReactNode, active: boolean, onClick: () => void, key?: React.Key }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border text-[11px] font-bold transition-all whitespace-nowrap ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
  >
    {icon && React.cloneElement(icon as React.ReactElement, { className: 'w-3 h-3' })}
    <span>{label}</span>
    {active && <Check className="w-3 h-3 ml-1" />}
  </button>
);
