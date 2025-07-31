
import React from 'react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onBackClick: () => void;
  canGoBack: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onBackClick, canGoBack }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 md:py-4 flex-shrink-0 flex items-center gap-3 safe-area-inset-top">
      <button onClick={onMenuClick} className="text-gray-300 hover:text-white flex-shrink-0" aria-label="Open menu">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg sm:text-xl font-bold text-white truncate flex-1 min-w-0">{title}</h1>
    </header>
  );
};

export default Header;