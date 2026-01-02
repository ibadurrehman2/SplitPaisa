
import React, { useState } from 'react';
import { useApp } from '../App';
import { Group, User } from '../types';
import { UserAvatar } from '../constants';
import { X, Check, Plane, Home, Briefcase, Users, Search, AlignLeft, Trash2, UserPlus, Phone, User as UserIcon, AlertTriangle, UserMinus } from 'lucide-react';

interface CreateGroupProps {
  onComplete: () => void;
  initialGroup?: Group;
}

export default function CreateGroup({ onComplete, initialGroup }: CreateGroupProps) {
  const { currentUser, users, addUser, addGroup, updateGroup, deleteGroup } = useApp();
  
  const [name, setName] = useState(initialGroup?.name || '');
  const [description, setDescription] = useState(initialGroup?.description || '');
  const [type, setType] = useState<Group['type']>(initialGroup?.type || 'Trip');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(initialGroup?.members || [currentUser!.id]);
  const [searchQuery, setSearchQuery] = useState('');

  // States for adding a new contact inline
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // State for deletion confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const groupTypes: { label: Group['type']; icon: React.ReactNode }[] = [
    { label: 'Trip', icon: <Plane className="w-5 h-5" /> },
    { label: 'Home', icon: <Home className="w-5 h-5" /> },
    { label: 'Office', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Others', icon: <Users className="w-5 h-5" /> },
  ];

  const toggleMember = (userId: string) => {
    if (userId === currentUser?.id) return;
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleCreateContact = () => {
    if (!newContactName.trim() || newContactPhone.length < 10) return;

    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name: newContactName.trim(),
      phone: newContactPhone,
      avatar: '' // Empty avatar to trigger Initials Placeholder
    };

    addUser(newUser);
    setSelectedMembers(prev => [...prev, newUser.id]);
    
    // Reset form
    setIsAddingContact(false);
    setNewContactName('');
    setNewContactPhone('');
    setSearchQuery('');
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const groupData: Group = {
      id: initialGroup?.id || Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      members: selectedMembers,
      createdAt: initialGroup?.createdAt || Date.now(),
    };

    if (initialGroup) {
      updateGroup(groupData);
    } else {
      addGroup(groupData);
    }

    onComplete();
  };

  const handleDelete = () => {
    if (initialGroup) {
      deleteGroup(initialGroup.id);
      onComplete();
    }
  };

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <button onClick={onComplete} className="p-2 text-slate-400">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-lg text-slate-800">{initialGroup ? 'Edit Group' : 'Create New Group'}</h2>
        <button 
          onClick={handleSave} 
          disabled={!name.trim() || showDeleteConfirm}
          className={`p-2 font-bold ${(!name.trim() || showDeleteConfirm) ? 'text-slate-300' : 'text-indigo-600'}`}
        >
          Done
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {/* Group Name Input */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Group Name</label>
          <input 
            type="text" 
            placeholder="e.g. Weekend Hike, Flatmates" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl font-bold outline-none border-b-2 border-slate-100 focus:border-indigo-600 pb-2 transition-colors placeholder:text-slate-200 text-slate-800 bg-white"
            autoFocus={!initialGroup}
            disabled={showDeleteConfirm}
          />
        </div>

        {/* Group Type Selection */}
        <div className="space-y-3">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Group Type</label>
          <div className="grid grid-cols-4 gap-3">
            {groupTypes.map(gt => (
              <button
                key={gt.label}
                disabled={showDeleteConfirm}
                onClick={() => setType(gt.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${type === gt.label ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'} ${showDeleteConfirm ? 'opacity-50' : ''}`}
              >
                {gt.icon}
                <span className="text-[10px] font-bold mt-2 uppercase">{gt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Member Selection */}
        <div className={`space-y-4 ${showDeleteConfirm ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Group Members</label>
            <span className="text-[10px] font-bold text-slate-500">{selectedMembers.length} selected</span>
          </div>

          {!isAddingContact ? (
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search existing friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-200 transition-colors text-slate-800"
                />
              </div>
              
              <button 
                onClick={() => setIsAddingContact(true)}
                className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-slate-200 rounded-2xl text-indigo-600 font-bold text-sm active:bg-indigo-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add a New Contact</span>
              </button>
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-3xl space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">New Contact Details</h4>
                <button onClick={() => setIsAddingContact(false)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center bg-white border border-slate-100 p-3 rounded-2xl space-x-3 focus-within:border-indigo-400 transition-colors">
                  <UserIcon className="w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300"
                    autoFocus
                  />
                </div>
                <div className="flex items-center bg-white border border-slate-100 p-3 rounded-2xl space-x-3 focus-within:border-indigo-400 transition-colors">
                  <Phone className="w-4 h-4 text-slate-300" />
                  <input 
                    type="tel" 
                    placeholder="Phone (10 digits)"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300"
                  />
                </div>
                <button 
                  onClick={handleCreateContact}
                  disabled={!newContactName.trim() || newContactPhone.length < 10}
                  className="w-full bg-indigo-600 disabled:bg-slate-200 text-white py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  Save & Add to Group
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center space-x-3">
                <UserAvatar user={currentUser || undefined} className="w-10 h-10" />
                <div>
                  <p className="font-bold text-sm text-slate-800">{currentUser?.name} (You)</p>
                  <p className="text-slate-400 text-xs">Organizer</p>
                </div>
              </div>
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>

            {selectedMembers.filter(id => id !== currentUser?.id).map(memberId => {
              const user = users.find(u => u.id === memberId);
              if (!user) return null;
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl border border-indigo-100 bg-white shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={user} className="w-10 h-10" />
                    <div>
                      <p className="font-bold text-sm text-slate-800">{user.name}</p>
                      <p className="text-slate-400 text-xs">+91 {user.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleMember(user.id)} 
                    className="w-9 h-9 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors"
                    title="Remove member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {filteredUsers.filter(u => !selectedMembers.includes(u.id)).map(user => (
              <button
                key={user.id}
                onClick={() => toggleMember(user.id)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <UserAvatar user={user} className="w-10 h-10 opacity-70" />
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-700">{user.name}</p>
                    <p className="text-slate-400 text-xs">+91 {user.phone}</p>
                  </div>
                </div>
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                   <UserPlus className="w-3 h-3 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Delete Action with Internal Confirmation */}
        {initialGroup && (
          <div className="pt-8">
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 text-rose-500 font-bold p-4 border-2 border-rose-100 rounded-3xl active:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Group</span>
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center space-x-3 text-rose-600">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-bold">Are you absolutely sure? This will delete all expenses and data for this group.</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white text-slate-600 font-bold py-3 rounded-2xl border border-rose-100 text-sm active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-rose-100 active:scale-95 transition-transform"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Action */}
      {!isAddingContact && !showDeleteConfirm && (
        <div className="p-6 border-t border-slate-100 bg-white">
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-indigo-600 disabled:bg-slate-200 text-white py-4 rounded-3xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            {initialGroup ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      )}
    </div>
  );
}
