
import React, { useState } from 'react';
import { useApp } from '../App';
import { calculateNetBalances, simplifyDebts } from '../utils/settlementEngine';
import { FORMAT_CURRENCY } from '../constants';
import { CheckCircle, ArrowRight, ShieldCheck, CreditCard, Banknote, Smartphone } from 'lucide-react';

export default function Settlements() {
  const { currentUser, users, expenses, settlements, addSettlement } = useApp();
  
  const balances = calculateNetBalances(users, expenses, settlements);
  const debts = simplifyDebts(balances);
  
  const myDebts = debts.filter(d => d.from === currentUser?.id);
  const peopleOwingMe = debts.filter(d => d.to === currentUser?.id);

  const handleSettle = (from: string, to: string, amount: number) => {
    addSettlement({
      id: Math.random().toString(36).substr(2, 9),
      from,
      to,
      amount,
      method: 'UPI',
      timestamp: Date.now()
    });
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settlements</h2>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center space-x-1 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Payments YOU need to make */}
        <section className="space-y-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Payments Pending</h3>
          {myDebts.length === 0 ? (
            <div className="bg-emerald-50 p-6 rounded-3xl text-center border border-emerald-100">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-emerald-800">No debts pending!</p>
              <p className="text-emerald-600/70 text-xs">You're completely settled up.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDebts.map((debt, idx) => {
                const recipient = users.find(u => u.id === debt.to);
                return (
                  <div key={`settle-${idx}`} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={recipient?.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
                        <div>
                          <p className="font-bold text-sm leading-tight">Pay {recipient?.name}</p>
                          <p className="text-slate-400 text-xs">UPI: {recipient?.phone}@okicici</p>
                        </div>
                      </div>
                      <p className="text-xl font-black text-rose-500">{FORMAT_CURRENCY(debt.amount)}</p>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <button 
                        onClick={() => handleSettle(debt.from, debt.to, debt.amount)}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Pay via UPI</span>
                      </button>
                      <button 
                        onClick={() => handleSettle(debt.from, debt.to, debt.amount)}
                        className="bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                      >
                        <Banknote className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Payments OTHERS need to make to you */}
        <section className="space-y-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Expected Payments</h3>
          {peopleOwingMe.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4 italic">No one owes you right now.</p>
          ) : (
            <div className="space-y-3">
              {peopleOwingMe.map((debt, idx) => {
                const debtor = users.find(u => u.id === debt.from);
                return (
                  <div key={`expect-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <img src={debtor?.avatar} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-sm leading-tight">{debtor?.name}</p>
                        <p className="text-emerald-600 text-[10px] font-bold">OWES YOU</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-bold text-lg">{FORMAT_CURRENCY(debt.amount)}</p>
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
