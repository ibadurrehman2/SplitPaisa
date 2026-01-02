
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { calculateNetBalances, simplifyDebts } from '../utils/settlementEngine';
import { FORMAT_CURRENCY, UserAvatar } from '../constants';
import { 
  CheckCircle, ChevronLeft, MoreVertical, ShieldCheck, 
  Smartphone, Banknote, ArrowRight, Search, X, 
  Check, CreditCard, UserPlus, Info
} from 'lucide-react';
import { User } from '../types';

type SettlementMethod = 'UPI' | 'Cash' | 'Bank';

export default function Settlements() {
  const { currentUser, users, expenses, settlements, addSettlement, setActiveTab } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [method, setMethod] = useState<SettlementMethod>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  const balances = calculateNetBalances(users, expenses, settlements);
  const debts = simplifyDebts(balances);
  
  const myDebts = debts.filter(d => d.from === currentUser?.id);
  const peopleOwingMe = debts.filter(d => d.to === currentUser?.id);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return users.filter(u => 
      u.id !== currentUser?.id && 
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery))
    ).slice(0, 5);
  }, [users, searchQuery, currentUser]);

  const handleSelectUser = (user: User) => {
    const debt = debts.find(d => d.from === currentUser?.id && d.to === user.id);
    setSelectedUser(user);
    setSettleAmount(debt ? debt.amount.toString() : '');
    setSearchQuery('');
  };

  const handleSettle = () => {
    if (!selectedUser || !settleAmount) return;
    
    setIsProcessing(true);
    
    // Simulate a brief processing delay for aesthetics
    setTimeout(() => {
      addSettlement({
        id: Math.random().toString(36).substr(2, 9),
        from: currentUser!.id,
        to: selectedUser.id,
        amount: parseFloat(settleAmount),
        method: method,
        timestamp: Date.now()
      });
      
      setIsProcessing(false);
      setSelectedUser(null);
      setSettleAmount('');
      setMethod('UPI');
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Centered Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500 active:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Settle Up</h2>
        <button 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 active:bg-slate-100 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto pb-24">
        {/* Search Bar */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Who did you pay?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:border-indigo-300 transition-all placeholder:font-medium placeholder:text-slate-300"
            />
          </div>
          
          {/* Search Results */}
          {filteredUsers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center space-x-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <UserAvatar user={user} className="w-10 h-10" />
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm text-slate-800">{user.name}</p>
                    <p className="text-slate-400 text-xs">+91 {user.phone}</p>
                  </div>
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pending Debts List */}
        {!selectedUser && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Suggested Payments</h3>
              <span className="text-rose-500 font-bold text-[10px] uppercase">{myDebts.length} Pending</span>
            </div>

            {myDebts.length === 0 ? (
              <div className="bg-white p-10 rounded-[32px] text-center border border-dashed border-slate-200 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                   <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">No pending debts!</p>
                  <p className="text-slate-400 text-xs mt-1">You are all squared up with your friends.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {myDebts.map((debt, idx) => {
                  const recipient = users.find(u => u.id === debt.to);
                  if (!recipient) return null;
                  return (
                    <button 
                      key={`suggested-${idx}`}
                      onClick={() => handleSelectUser(recipient)}
                      className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:border-indigo-200"
                    >
                      <div className="flex items-center space-x-4">
                        <UserAvatar user={recipient} className="w-12 h-12" />
                        <div className="text-left">
                          <p className="font-bold text-sm text-slate-800">Pay {recipient.name.split(' ')[0]}</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Suggested</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-rose-500 leading-tight">{FORMAT_CURRENCY(debt.amount)}</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase">Click to settle</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Expected Payments (Others owe you) */}
        {!selectedUser && peopleOwingMe.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-1">Expecting from others</h3>
            <div className="space-y-3">
              {peopleOwingMe.map((debt, idx) => {
                const debtor = users.find(u => u.id === debt.from);
                if (!debtor) return null;
                return (
                  <div key={`expect-${idx}`} className="bg-white/50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={debtor} className="w-10 h-10" />
                      <div>
                        <p className="font-bold text-sm text-slate-700">{debtor.name}</p>
                        <p className="text-emerald-600 text-[10px] font-bold">OWES YOU</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg text-slate-800">{FORMAT_CURRENCY(debt.amount)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Settle Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
            onClick={() => !isProcessing && setSelectedUser(null)} 
          />
          <div className="bg-white rounded-t-[40px] shadow-2xl relative z-10 p-8 space-y-8 animate-in slide-in-from-bottom-full duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserAvatar user={selectedUser} className="w-12 h-12" />
                <div>
                  <h3 className="text-lg font-black text-slate-800">Settle with {selectedUser.name}</h3>
                  <p className="text-slate-400 text-xs font-medium">+91 {selectedUser.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                disabled={isProcessing}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Amount Paid</label>
              <div className="flex items-center bg-slate-50 border border-slate-100 p-6 rounded-[32px] focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-sm">
                <span className="text-2xl font-black text-slate-300 mr-4">₹</span>
                <input 
                  type="number" 
                  placeholder="0"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-3xl font-black text-slate-800 placeholder:text-slate-200"
                  autoFocus
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <MethodButton 
                  label="UPI" 
                  icon={<Smartphone className="w-4 h-4" />} 
                  active={method === 'UPI'} 
                  onClick={() => setMethod('UPI')} 
                />
                <MethodButton 
                  label="Cash" 
                  icon={<Banknote className="w-4 h-4" />} 
                  active={method === 'Cash'} 
                  onClick={() => setMethod('Cash')} 
                />
                <MethodButton 
                  label="Bank" 
                  icon={<CreditCard className="w-4 h-4" />} 
                  active={method === 'Bank'} 
                  onClick={() => setMethod('Bank')} 
                />
              </div>
            </div>

            {/* Confirm Button */}
            <button 
              onClick={handleSettle}
              disabled={!settleAmount || parseFloat(settleAmount) <= 0 || isProcessing}
              className={`w-full py-5 rounded-[32px] font-black text-lg shadow-xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] ${(!settleAmount || parseFloat(settleAmount) <= 0 || isProcessing) ? 'bg-slate-100 text-slate-300 shadow-none' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  <span>Confirm Settlement</span>
                </>
              )}
            </button>
            
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 inline-block mr-1 -mt-0.5 text-emerald-500" />
              Verified Local Recording
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const MethodButton = ({ label, icon, active, onClick }: { label: SettlementMethod, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${active ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
  >
    {icon}
    <span className="text-[10px] font-black mt-2 uppercase tracking-widest">{label}</span>
  </button>
);
