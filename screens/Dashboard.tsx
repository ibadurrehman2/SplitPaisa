
import React from 'react';
import { useApp } from '../App';
import { calculateNetBalances, simplifyDebts } from '../utils/settlementEngine';
import { FORMAT_CURRENCY, FORMAT_DATE, CATEGORIES } from '../constants';
import { TrendingUp, TrendingDown, Bell, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, users, expenses, settlements } = useApp();
  
  const balances = calculateNetBalances(users, expenses, settlements);
  const myBalance = balances[currentUser!.id] || 0;
  const debts = simplifyDebts(balances);
  
  // People who owe me
  const peopleWhoOweMe = debts.filter(d => d.to === currentUser!.id);
  // People I owe
  const peopleIOwe = debts.filter(d => d.from === currentUser!.id);

  const totalOwed = peopleWhoOweMe.reduce((acc, d) => acc + d.amount, 0);
  const totalIOwe = peopleIOwe.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hello, {currentUser?.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 text-sm">Your expense overview</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100"><Search className="w-5 h-5 text-slate-500" /></button>
          <button className="p-2 bg-white rounded-full shadow-sm border border-slate-100 relative">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
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
          <button className="text-indigo-600 text-sm font-semibold">See all</button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {peopleWhoOweMe.length === 0 && peopleIOwe.length === 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-2">
              <p className="text-slate-500">All settled up! ✨</p>
            </div>
          )}
          
          {peopleWhoOweMe.map((debt, idx) => {
            const user = users.find(u => u.id === debt.from);
            return (
              <div key={`oweme-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-emerald-600 text-[11px] font-bold">OWES YOU</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">{FORMAT_CURRENCY(debt.amount)}</p>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500 ml-auto" />
                </div>
              </div>
            );
          })}

          {peopleIOwe.map((debt, idx) => {
            const user = users.find(u => u.id === debt.to);
            return (
              <div key={`iowe-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <img src={user?.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-rose-600 text-[11px] font-bold">YOU OWE</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">{FORMAT_CURRENCY(debt.amount)}</p>
                  <ArrowDownRight className="w-4 h-4 text-rose-500 ml-auto" />
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
          <Filter className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="space-y-3">
          {expenses.slice(0, 5).map(exp => {
            const cat = CATEGORIES.find(c => c.label === exp.category);
            const payer = users.find(u => u.id === exp.paidBy);
            const isMyExpense = exp.paidBy === currentUser?.id;
            
            return (
              <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${cat?.color || 'bg-slate-100 text-slate-500'}`}>
                    {cat?.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{exp.title}</p>
                    <p className="text-slate-400 text-xs mt-1">Paid by {payer?.name.split(' ')[0]} • {FORMAT_DATE(exp.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{FORMAT_CURRENCY(exp.amount)}</p>
                  <p className={`text-[10px] font-bold ${isMyExpense ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isMyExpense ? 'LENT' : 'OWE'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
