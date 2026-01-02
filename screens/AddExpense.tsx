import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Category, SplitMember } from '../types';
import { CATEGORIES, FORMAT_CURRENCY } from '../constants';
import { X, FileText, ChevronDown, Users, AlertCircle } from 'lucide-react';

export default function AddExpense({ onComplete }: { onComplete: () => void }) {
  const { currentUser, groups, users, addExpense } = useApp();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [category, setCategory] = useState<Category>('Food');
  const [paidBy, setPaidBy] = useState(currentUser!.id);
  const [splitType, setSplitType] = useState<'equal' | 'exact'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupMembers = users.filter(u => selectedGroup?.members.includes(u.id));

  // Initialize custom splits when members or amount change
  useEffect(() => {
    if (splitType === 'exact') {
      const initialSplits: Record<string, string> = {};
      groupMembers.forEach(m => {
        initialSplits[m.id] = customSplits[m.id] || '';
      });
      setCustomSplits(initialSplits);
    }
  }, [selectedGroupId, splitType]);

  const totalAmount = parseFloat(amount) || 0;
  // Fix: Explicitly type reduce parameters and return type to resolve unknown inference issues
  // Using Object.keys and accessing values manually to ensure proper type inference as number
  const currentSplitTotal: number = Object.keys(customSplits).reduce((sum: number, key: string): number => {
    const val = customSplits[key];
    const parsedVal = parseFloat(val);
    return sum + (isNaN(parsedVal) ? 0 : parsedVal);
  }, 0);
  const isSplitValid = splitType === 'equal' || Math.abs(currentSplitTotal - totalAmount) < 0.01;

  const handleSave = () => {
    if (!title || totalAmount <= 0 || !isSplitValid) return;

    let splits: SplitMember[] = [];

    if (splitType === 'equal') {
      const perPerson = totalAmount / groupMembers.length;
      splits = groupMembers.map(m => ({ userId: m.id, amount: perPerson }));
    } else {
      splits = groupMembers.map(m => ({ 
        userId: m.id, 
        amount: parseFloat(customSplits[m.id]) || 0 
      }));
    }

    addExpense({
      id: Math.random().toString(36).substr(2, 9),
      groupId: selectedGroupId,
      title,
      amount: totalAmount,
      date: new Date().toISOString(),
      category,
      paidBy,
      splits
    });

    onComplete();
  };

  const updateCustomSplit = (userId: string, val: string) => {
    setCustomSplits(prev => ({ ...prev, [userId]: val }));
  };

  return (
    <div className="min-h-full bg-white flex flex-col">
      {/* Navbar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <button onClick={onComplete} className="p-2 text-slate-400"><X className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg text-slate-800">Add Expense</h2>
        <button 
          onClick={handleSave} 
          disabled={!title || totalAmount <= 0 || !isSplitValid}
          className={`p-2 font-bold transition-colors ${(!title || totalAmount <= 0 || !isSplitValid) ? 'text-slate-300' : 'text-indigo-600'}`}
        >
          Save
        </button>
      </div>

      <div className="flex-1 p-6 space-y-8 pb-32">
        {/* Main Amount Input */}
        <div className="space-y-2 text-center">
          <label className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Amount</label>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-4xl font-bold text-slate-300">₹</span>
            <input 
              type="number" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-5xl font-black w-48 text-center bg-transparent border-none outline-none placeholder:text-slate-200 text-slate-800"
              autoFocus
            />
          </div>
        </div>

        {/* Form Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText className="w-5 h-5" /></div>
            <input 
              type="text" 
              placeholder="What was it for?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 outline-none font-medium placeholder:text-slate-300 text-slate-800 bg-white"
            />
          </div>

          <div className="flex items-center space-x-4 border-b border-slate-100 pb-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <div className="flex-1 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">In Group</span>
              <select 
                className="outline-none font-bold bg-transparent text-slate-800 py-1"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${category === cat.label ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500'}`}
                >
                  {cat.icon}
                  <span className="text-sm font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paid By Selection */}
          <div className="bg-slate-50 p-4 rounded-3xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">Paid by</span>
              <div className="relative group min-w-[120px]">
                <select 
                  className="w-full appearance-none bg-white px-4 py-2 pr-8 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 transition-colors"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {groupMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.id === currentUser?.id ? 'You' : member.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">Split</span>
              <button 
                onClick={() => setSplitType(splitType === 'equal' ? 'exact' : 'equal')}
                className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-700 active:scale-95 transition-transform"
              >
                {splitType === 'equal' ? 'Equally' : 'Custom'}
              </button>
            </div>
          </div>

          {/* Custom Split Details */}
          {splitType === 'exact' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Manual Split (INR)</label>
                <div className={`flex items-center space-x-1 text-[10px] font-bold ${isSplitValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {!isSplitValid && <AlertCircle className="w-3 h-3" />}
                  <span>Total: {FORMAT_CURRENCY(currentSplitTotal)} / {FORMAT_CURRENCY(totalAmount)}</span>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
                {groupMembers.map(member => (
                  <div key={member.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={member.avatar} className="w-8 h-8 rounded-full bg-slate-100" />
                      <span className="text-sm font-semibold text-slate-700">{member.name}</span>
                    </div>
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 focus-within:border-indigo-300 transition-colors">
                      <span className="text-slate-300 text-xs font-bold mr-1">₹</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={customSplits[member.id] || ''}
                        onChange={(e) => updateCustomSplit(member.id, e.target.value)}
                        className="bg-transparent w-20 text-right outline-none text-sm font-bold text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!isSplitValid && totalAmount > 0 && (
                <p className="text-[10px] text-rose-500 font-bold text-center">
                  Total must equal {FORMAT_CURRENCY(totalAmount)} (Off by {FORMAT_CURRENCY(Math.abs(totalAmount - currentSplitTotal))})
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Save */}
        <button 
          onClick={handleSave}
          disabled={!title || totalAmount <= 0 || !isSplitValid}
          className={`w-full py-4 rounded-3xl font-bold text-lg shadow-xl transition-all mt-4 active:scale-95 ${(!title || totalAmount <= 0 || !isSplitValid) ? 'bg-slate-100 text-slate-300 shadow-none' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
