
import React, { useState } from 'react';
import { useApp } from '../App';
import { Group } from '../types';
import { calculateNetBalances } from '../utils/settlementEngine';
import { FORMAT_CURRENCY } from '../constants';
import { Users, ChevronLeft, Plane, Briefcase, Home, Plus, Settings } from 'lucide-react';
import CreateGroup from './CreateGroup';

export default function Groups() {
  const { groups, users, expenses, settlements, currentUser, setActiveTab } = useApp();
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'Trip': return <Plane className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Office': return <Briefcase className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getGroupBalance = (groupId: string) => {
    const balances = calculateNetBalances(users, expenses, settlements, groupId);
    return balances[currentUser!.id] || 0;
  };

  if (isCreating) {
    return <CreateGroup onComplete={() => setIsCreating(false)} />;
  }

  if (editingGroup) {
    return <CreateGroup onComplete={() => setEditingGroup(null)} initialGroup={editingGroup} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Centered Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500 active:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Groups</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-full text-indigo-600 active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {groups.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-slate-400">No groups yet</p>
                <p className="text-slate-300 text-sm">Create one to start splitting!</p>
              </div>
              <button 
                onClick={() => setIsCreating(true)}
                className="text-indigo-600 font-bold text-sm"
              >
                Start a new group
              </button>
            </div>
          ) : (
            groups.map(group => {
              const balance = getGroupBalance(group.id);
              const isSettled = Math.abs(balance) < 0.01;

              return (
                <div 
                  key={group.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 text-left flex items-center justify-between shadow-sm relative overflow-hidden active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center`}>
                      {getGroupIcon(group.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg leading-tight truncate">{group.name}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">{group.members.length} members</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-2">
                      {isSettled ? (
                        <span className="text-slate-400 text-xs font-semibold">Settled</span>
                      ) : (
                        <>
                          <p className={`text-[10px] font-bold uppercase tracking-tighter ${balance > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {balance > 0 ? 'You are owed' : 'You owe'}
                          </p>
                          <p className="text-base font-black text-slate-800">{FORMAT_CURRENCY(Math.abs(balance))}</p>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => setEditingGroup(group)}
                      className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
