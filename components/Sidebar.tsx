
import React from 'react';
import type { View } from '../types';
import DashboardIcon from './icons/DashboardIcon';
import TransactionsIcon from './icons/TransactionsIcon';
import GoalsIcon from './icons/GoalsIcon';
import ProjectionsIcon from './icons/ProjectionsIcon';
import NotesIcon from './icons/NotesIcon';
import ResourcesIcon from './icons/ResourcesIcon';
import AIIcon from './icons/AIIcon';
import ProfileIcon from './icons/ProfileIcon';
import HistoryIcon from './icons/HistoryIcon';
import ToolsIcon from './icons/ToolsIcon';
import ShoppingListIcon from './icons/ShoppingListIcon';
import ReceiptsIcon from './icons/ReceiptsIcon';
import StoresIcon from './icons/StoresIcon';


interface SidebarProps {
  activeView: View;
  navigateTo: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  activeView: View;
  navigateTo: (view: View) => void;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ view, label, activeView, navigateTo, icon, onClick }) => {
  const isActive = activeView === view;
  
  const handleClick = () => {
      navigateTo(view);
      onClick();
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center w-full px-3 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-brand-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      <span className="w-5 h-5 mr-2.5">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, navigateTo, isOpen, setIsOpen }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'Dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { view: 'Profile', label: 'Profile', icon: <ProfileIcon /> },
    { view: 'Transactions', label: 'Transactions', icon: <TransactionsIcon /> },
    { view: 'ShoppingList', label: 'Shopping List', icon: <ShoppingListIcon /> },
    { view: 'Receipts', label: 'Receipts', icon: <ReceiptsIcon /> },
    { view: 'Stores', label: 'Stores', icon: <StoresIcon /> },
    { view: 'Goals', label: 'Goals', icon: <GoalsIcon /> },
    { view: 'Projections', label: 'Projections', icon: <ProjectionsIcon /> },
    { view: 'Tools', label: 'Financial Tools', icon: <ToolsIcon /> },
    { view: 'AIAdvisor', label: 'AI Advisor', icon: <AIIcon /> },
    { view: 'Notes', label: 'Notes', icon: <NotesIcon /> },
    { view: 'Resources', label: 'Resources', icon: <ResourcesIcon /> },
    { view: 'History', label: 'History', icon: <HistoryIcon /> },
  ];

  const handleNavItemClick = () => {
      setIsOpen(false);
  }

  return (
    <aside className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 p-4 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-between gap-2 px-2 mb-6">
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
                <AIIcon className="w-6 h-6 text-brand-500"/>
            </div>
            <h1 className="text-lg font-bold text-white">MoolaBuddy</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => (
          <NavItem key={item.view} {...item} activeView={activeView} navigateTo={navigateTo} onClick={handleNavItemClick} />
        ))}
      </nav>
      <div className="mt-auto text-center text-xs text-gray-500 pt-4">
        <p>&copy; 2024 MoolaBuddy</p>
        <p className="text-xs">Your Smart Finance Buddy</p>
      </div>
    </aside>
  );
};

export default Sidebar;