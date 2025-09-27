import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "relative z-50 max-w-sm w-full p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 shadow-2xl";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/10 border-green-500/30 text-green-100 shadow-lg shadow-green-500/20`;
      case 'error':
        return `${baseStyles} bg-red-500/10 border-red-500/30 text-red-100 shadow-lg shadow-red-500/20`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/10 border-yellow-500/30 text-yellow-100 shadow-lg shadow-yellow-500/20`;
      default:
        return `${baseStyles} bg-blue-500/10 border-blue-500/30 text-blue-100 shadow-lg shadow-blue-500/20`;
    }
  };

  return (
    <div className={`${getToastStyles()} ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex-1 mr-3">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-300 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast; 