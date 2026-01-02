
import React, { useEffect } from 'react';
import { useApp } from '../App';
import { ChevronLeft, Bell, Trash2, CreditCard, Receipt, Users, Clock } from 'lucide-react';
import { FORMAT_DATE, UserAvatar } from '../constants';

export default function NotificationsScreen() {
  const { setActiveTab, notifications, markNotificationsRead, users } = useApp();

  useEffect(() => {
    // When the screen is opened, mark all as read
    markNotificationsRead();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800">Notifications</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(n => {
              const fromUser = n.fromUserId ? users.find(u => u.id === n.fromUserId) : undefined;
              return (
                <div key={n.id} className="flex space-x-4 p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <UserAvatar user={fromUser} className="w-12 h-12" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                      {!n.read && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{n.description}</p>
                    <div className="flex items-center space-x-1 text-slate-300 text-[10px] font-bold mt-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {FORMAT_DATE(n.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
