
import React, { useState } from 'react';
import { useApp } from '../App';
import { ChevronLeft, Search as SearchIcon, X, Calendar, Users, ArrowRight } from 'lucide-react';
import { FORMAT_CURRENCY, FORMAT_DATE, CATEGORIES, UserAvatar } from '../constants';

export default function SearchScreen() {
  const { setActiveTab, expenses, groups, users, setEditingExpense } = useApp();
  const [query, setQuery] = useState('');

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectExpense = (exp: any) => {
    setEditingExpense(exp);
    setActiveTab('add');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center space-x-3 border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search expenses, groups..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pl-10 pr-10 outline-none focus:border-indigo-300 transition-colors text-sm font-medium"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {!query ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-400">Search SplitPaisa</p>
              <p className="text-slate-300 text-sm px-10">Search through all your expenses, groups and settlements.</p>
            </div>
          </div>
        ) : (
          <>
            {filteredGroups.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Groups</h3>
                <div className="space-y-2">
                  {filteredGroups.map(group => (
                    <button 
                      key={group.id}
                      onClick={() => setActiveTab('groups')}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 active:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-slate-800">{group.name}</p>
                          <p className="text-xs text-slate-400">{group.members.length} members</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Expenses</h3>
              {filteredExpenses.length === 0 ? (
                <p className="text-center text-slate-300 py-4 text-sm">No expenses found matching "{query}"</p>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map(exp => {
                    const payer = users.find(u => u.id === exp.paidBy);
                    return (
                      <div 
                        key={exp.id} 
                        onClick={() => handleSelectExpense(exp)}
                        className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm active:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <UserAvatar user={payer} className="w-12 h-12" />
                          <div>
                            <p className="font-bold text-sm leading-tight">{exp.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              <span className="text-slate-400 text-[10px] font-medium">{FORMAT_DATE(exp.date)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-slate-800">{FORMAT_CURRENCY(exp.amount)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
