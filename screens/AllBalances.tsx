
import React from 'react';
import { useApp } from '../App';
import { calculateNetBalances, simplifyDebts } from '../utils/settlementEngine';
import { FORMAT_CURRENCY, UserAvatar } from '../constants';
import { ChevronLeft, ArrowRight, TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function AllBalancesScreen() {
  const { setActiveTab, users, expenses, settlements, currentUser } = useApp();

  const netBalances = calculateNetBalances(users, expenses, settlements);
  const debts = simplifyDebts(netBalances);

  // Group debts by category for better visualization
  const youAreOwed = debts.filter(d => d.to === currentUser?.id);
  const youOwe = debts.filter(d => d.from === currentUser?.id);
  const othersOweOthers = debts.filter(d => d.to !== currentUser?.id && d.from !== currentUser?.id);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800">All Balances</h2>
        <button className="w-10 h-10 flex items-center justify-center text-slate-300">
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-10">
        {/* Your Summary Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Your Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-[10px] font-bold text-emerald-600 uppercase">You are owed</p>
              <p className="text-xl font-black text-emerald-800">{FORMAT_CURRENCY(youAreOwed.reduce((s, d) => s + d.amount, 0))}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
              <TrendingDown className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-[10px] font-bold text-rose-600 uppercase">You owe total</p>
              <p className="text-xl font-black text-rose-800">{FORMAT_CURRENCY(youOwe.reduce((s, d) => s + d.amount, 0))}</p>
            </div>
          </div>
        </section>

        {/* Detailed List */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Detailed Breakdown</h3>
          
          <div className="space-y-4">
            {/* You are owed by */}
            {youAreOwed.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-emerald-600 px-2 uppercase">Who owes you</p>
                {youAreOwed.map((debt, idx) => {
                  const fromUser = users.find(u => u.id === debt.from);
                  return (
                    <BalanceItem key={`owed-${idx}`} from={fromUser} to={currentUser} amount={debt.amount} type="owed" />
                  );
                })}
              </div>
            )}

            {/* You owe to */}
            {youOwe.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-rose-600 px-2 uppercase">Who you owe</p>
                {youOwe.map((debt, idx) => {
                  const toUser = users.find(u => u.id === debt.to);
                  return (
                    <BalanceItem key={`owe-${idx}`} from={currentUser} to={toUser} amount={debt.amount} type="owe" />
                  );
                })}
              </div>
            )}

            {/* Others between others */}
            {othersOweOthers.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 px-2 uppercase">Other members</p>
                {othersOweOthers.map((debt, idx) => {
                  const fromUser = users.find(u => u.id === debt.from);
                  const toUser = users.find(u => u.id === debt.to);
                  return (
                    <BalanceItem key={`other-${idx}`} from={fromUser} to={toUser} amount={debt.amount} type="other" />
                  );
                })}
              </div>
            )}

            {debts.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 p-10 rounded-3xl text-center space-y-2">
                <p className="text-slate-400 font-bold">No pending balances!</p>
                <p className="text-slate-300 text-xs">Everyone is completely settled up.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="p-5 border-t border-slate-50">
        <button 
          onClick={() => setActiveTab('settle')}
          className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-bold text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-transform"
        >
          Settle Up Now
        </button>
      </div>
    </div>
  );
}

interface BalanceItemProps {
  key?: React.Key;
  from: any;
  to: any;
  amount: number;
  type: 'owed' | 'owe' | 'other';
}

const BalanceItem = ({ from, to, amount, type }: BalanceItemProps) => (
  <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
    <div className="flex items-center space-x-3">
      <div className="flex -space-x-3">
        <UserAvatar user={from} className="w-8 h-8" />
        <UserAvatar user={to} className="w-8 h-8" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-slate-700">{from?.name.split(' ')[0]}</span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className="font-bold text-sm text-slate-700">{to?.name.split(' ')[0]}</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">{from?.name} owes {to?.name}</p>
      </div>
    </div>
    <p className={`font-black ${type === 'owed' ? 'text-emerald-600' : type === 'owe' ? 'text-rose-600' : 'text-slate-700'}`}>
      {FORMAT_CURRENCY(amount)}
    </p>
  </div>
);
