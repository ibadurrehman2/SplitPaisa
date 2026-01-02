
import React, { useRef } from 'react';
import { useApp } from '../App';
import { UserAvatar } from '../constants';
import { Settings, LogOut, ChevronRight, ChevronLeft, MoreVertical, Share2, Shield, CircleHelp, Smartphone, Camera } from 'lucide-react';

export default function Profile() {
  const { currentUser, setCurrentUser, updateUser, setActiveTab } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUser({
          ...currentUser,
          avatar: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Account</h2>
        <button 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 active:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-8">
        {/* Profile Info */}
        <div className="flex flex-col items-center pt-4 space-y-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            {/* Using the standard UserAvatar component for initials logic */}
            <UserAvatar 
              user={currentUser || undefined} 
              className="w-28 h-28 rounded-[40px] shadow-2xl border-4 border-white" 
              textClass="text-3xl"
            />
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-2xl text-white border-4 border-white shadow-lg group-active:scale-90 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 leading-tight">{currentUser?.name}</h2>
            <p className="text-slate-400 font-medium tracking-tight mt-1">+91 {currentUser?.phone}</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <MenuLink icon={<Shield className="w-5 h-5" />} label="Security & Privacy" />
            <MenuLink icon={<Smartphone className="w-5 h-5" />} label="Linked Accounts & UPI" />
            <MenuLink icon={<Share2 className="w-5 h-5" />} label="Refer a Friend" badge="NEW" />
            <MenuLink icon={<CircleHelp className="w-5 h-5" />} label="Help & Support" last />
          </div>

          <button 
            onClick={() => setCurrentUser(null)}
            className="w-full bg-rose-50 text-rose-600 py-4 rounded-[32px] font-bold flex items-center justify-center space-x-2 active:bg-rose-100 transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">SplitPaisa v1.0.4 India</p>
        </div>
      </div>
    </div>
  );
}

const MenuLink = ({ icon, label, badge, last }: { icon: React.ReactNode, label: string, badge?: string, last?: boolean }) => (
  <button className={`w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors ${!last ? 'border-b border-slate-50' : ''}`}>
    <div className="flex items-center space-x-4">
      <div className="text-indigo-600 bg-indigo-50 p-2.5 rounded-xl">{icon}</div>
      <span className="font-bold text-slate-700">{label}</span>
      {badge && <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded font-black tracking-wider">{badge}</span>}
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300" />
  </button>
);
