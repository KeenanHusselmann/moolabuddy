
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
  const navItems = [
    { view: 'Dashboard' as View, label: 'Dashboard', icon: <DashboardIcon /> },
    { view: 'Transactions' as View, label: 'Transactions', icon: <TransactionsIcon /> },
    { view: 'FinancialTools' as View, label: 'Financial Tools', icon: <ToolsIcon /> },
    { view: 'Goals' as View, label: 'Goals', icon: <GoalsIcon /> },
    { view: 'History' as View, label: 'History', icon: <HistoryIcon /> },
    { view: 'Projections' as View, label: 'Projections', icon: <ProjectionsIcon /> },
    { view: 'AIAdvisor' as View, label: 'AI Advisor', icon: <AIIcon /> },
    { view: 'Notes' as View, label: 'Notes', icon: <NotesIcon /> },
    { view: 'Receipts' as View, label: 'Receipts', icon: <ReceiptsIcon /> },
    { view: 'ShoppingList' as View, label: 'Shopping List', icon: <ShoppingListIcon /> },
    { view: 'Stores' as View, label: 'Stores', icon: <StoresIcon /> },
    { view: 'Resources' as View, label: 'Resources', icon: <ResourcesIcon /> },
    { view: 'Profile' as View, label: 'Profile', icon: <ProfileIcon /> },
  ];

  const handleNavigation = (view: View) => {
    navigateTo(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 z-[70]
          transition-transform duration-300 ease-in-out
          w-72 max-w-[calc(100vw-2rem)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          safe-area-inset-left
        `}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          height: 'calc(100vh - env(safe-area-inset-top))',
          top: 'env(safe-area-inset-top)'
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo2.png" alt="MoolaBuddy" className="w-8 h-8 rounded-lg" />
                <h2 className="text-lg font-bold text-white">MoolaBuddy</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavigation(item.view)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left
                    ${activeView === item.view 
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <div className={`w-5 h-5 flex-shrink-0 ${
                    activeView === item.view ? 'text-brand-400' : 'text-gray-400'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <div className="text-center">
              <p className="text-xs text-gray-400">Version 2.1.0</p>
              <p className="text-xs text-gray-500 mt-1">
                Professional Finance Tracker
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;