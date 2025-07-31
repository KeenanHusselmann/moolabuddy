import React from 'react';
import type { View } from '../types';
import TransactionsIcon from './icons/TransactionsIcon';
import ReceiptsIcon from './icons/ReceiptsIcon';
import NotesIcon from './icons/NotesIcon';
import ProfileIcon from './icons/ProfileIcon';
import AIIcon from './icons/AIIcon';

interface BottomNavProps {
  activeView: View;
  navigateTo: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, navigateTo }) => {
  const navItems = [
    { view: 'Transactions' as View, label: 'Transactions', icon: <TransactionsIcon /> },
    { view: 'Receipts' as View, label: 'Receipts', icon: <ReceiptsIcon /> },
    { view: 'AIAdvisor' as View, label: 'AI Advisor', icon: <AIIcon /> },
    { view: 'Notes' as View, label: 'Notes', icon: <NotesIcon /> },
    { view: 'Profile' as View, label: 'Profile', icon: <ProfileIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center px-1 py-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => navigateTo(item.view)}
            className={`flex flex-col items-center justify-center w-full py-1 px-0.5 transition-all duration-200 ${
              activeView === item.view
                ? 'text-brand-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className={`w-8 h-8 mb-1 rounded-full flex items-center justify-center transition-all duration-200 ${
              activeView === item.view 
                ? 'bg-brand-500/20 text-brand-400' 
                : 'text-gray-400 hover:bg-gray-800/50'
            }`}>
              {item.icon}
            </div>
            <span className="text-xs font-medium leading-tight text-center">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
