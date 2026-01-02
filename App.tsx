
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Group, Expense, Settlement, Category, AppNotification } from './types';
import { Home, Users, PlusCircle, CreditCard, User as UserIcon, History } from 'lucide-react';
import Dashboard from './screens/Dashboard';
import Groups from './screens/Groups';
import AddExpense from './screens/AddExpense';
import Settlements from './screens/Settlements';
import Profile from './screens/Profile';
import Auth from './screens/Auth';
import SearchScreen from './screens/Search';
import NotificationsScreen from './screens/Notifications';
import AllBalancesScreen from './screens/AllBalances';
import HistoryScreen from './screens/History';

// --- Context Definitions ---
interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  notifications: AppNotification[];
  addExpense: (e: Expense) => void;
  updateExpense: (e: Expense) => void;
  addSettlement: (s: Settlement) => void;
  addGroup: (g: Group) => void;
  updateGroup: (g: Group) => void;
  deleteGroup: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'groups' | 'history' | 'add' | 'settle' | 'profile' | 'search' | 'notifications' | 'allBalances') => void;
  editingExpense: Expense | null;
  setEditingExpense: (e: Expense | null) => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- App Component ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'groups' | 'history' | 'add' | 'settle' | 'profile' | 'search' | 'notifications' | 'allBalances'>('home');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const addUser = (u: User) => setUsers(prev => [...prev, u]);
  
  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addExpense = (e: Expense) => {
    setExpenses(prev => [e, ...prev]);
    const group = groups.find(g => g.id === e.groupId);
    addNotification({
      title: 'New Expense',
      description: `₹${e.amount} spent for "${e.title}" in ${group?.name || 'a group'}`,
      type: 'expense',
      fromUserId: e.paidBy
    });
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    addNotification({
      title: 'Expense Updated',
      description: `"${updatedExpense.title}" has been modified`,
      type: 'expense',
      fromUserId: currentUser?.id
    });
  };

  const addSettlement = (s: Settlement) => {
    setSettlements(prev => [s, ...prev]);
    const fromUser = users.find(u => u.id === s.from);
    const toUser = users.find(u => u.id === s.to);
    addNotification({
      title: 'Settlement Recorded',
      description: `${fromUser?.name} paid ${toUser?.name} ₹${s.amount}`,
      type: 'settlement',
      fromUserId: s.from
    });
  };

  const addGroup = (g: Group) => {
    setGroups(prev => [...prev, g]);
    addNotification({
      title: 'New Group Created',
      description: `You created the group "${g.name}"`,
      type: 'group',
      fromUserId: currentUser?.id
    });
  };

  if (!currentUser) {
    return (
      <Auth 
        users={users} 
        onLogin={(user) => {
          if (!users.find(u => u.id === user.id || u.phone === user.phone)) {
            addUser(user);
          }
          setCurrentUser(user);
        }} 
      />
    );
  }

  const updateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setExpenses(prev => prev.filter(e => e.groupId !== id));
    setSettlements(prev => prev.filter(s => s.groupId !== id));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'groups': return <Groups />;
      case 'history': return <HistoryScreen />;
      case 'add': return (
        <AddExpense 
          initialExpense={editingExpense} 
          onComplete={() => {
            setEditingExpense(null);
            setActiveTab('home');
          }} 
        />
      );
      case 'settle': return <Settlements />;
      case 'profile': return <Profile />;
      case 'search': return <SearchScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'allBalances': return <AllBalancesScreen />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser, users, addUser, updateUser, groups, expenses, settlements, notifications,
      addExpense, updateExpense, addSettlement, addGroup, updateGroup, deleteGroup,
      activeTab, setActiveTab, editingExpense, setEditingExpense, markNotificationsRead
    }}>
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden relative border-x border-slate-100">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 bg-slate-50">
          {renderScreen()}
        </main>

        {/* Floating Action Button (FAB) for Quick Add */}
        <button 
          onClick={() => {
            setEditingExpense(null);
            setActiveTab('add');
          }}
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 transition-transform active:scale-90 z-20 ${activeTab === 'add' ? 'scale-110 rotate-45 bg-rose-500 shadow-rose-100' : ''}`}
        >
          <PlusCircle className="w-8 h-8" />
        </button>

        {/* Bottom Navigation Bar */}
        <nav className="h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 safe-area-bottom z-10">
          <NavItem icon={<Home />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<History />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <div className="w-16"></div> {/* Spacer for FAB */}
          <NavItem icon={<Users />} label="Groups" active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />
          <NavItem icon={<UserIcon />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </div>
    </AppContext.Provider>
  );
}

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}
  >
    <div className={`p-1.5 rounded-xl ${active ? 'bg-indigo-50' : ''}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
  </button>
);
