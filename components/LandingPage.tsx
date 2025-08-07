import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onComplete: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start entrance animation
    setIsVisible(true);
    
    // Auto-navigate to dashboard after 3 seconds
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center transition-all duration-1000 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    } ${isAnimating ? 'scale-110 opacity-0' : 'scale-100'}`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Namibian-inspired colors: Blue, Red, Green, Gold */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-green-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-yellow-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative inline-block animate-float">
            {/* Logo Circle */}
            <div className="w-40 h-40 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl animate-glow">
              {/* Logo2 Image */}
              <img 
                src="/logo2.png" 
                alt="MoolaBuddy Logo" 
                className="w-32 h-32 object-contain rounded-2xl"
                onError={(e) => {
                  // Fallback if logo2.png doesn't exist
                  console.warn('Logo2 not found, using fallback');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            {/* Animated Ring */}
            <div className="absolute inset-0 w-40 h-40 border-2 border-brand-400/50 rounded-3xl animate-ping"></div>
            <div className="absolute inset-0 w-40 h-40 border-2 border-brand-300/50 rounded-3xl animate-pulse"></div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight animate-float text-white" style={{ animationDelay: '0.5s' }}>
          <span className="text-brand-400">Moola</span>
          <span className="text-brand-300">Buddy</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-2 font-light animate-float" style={{ animationDelay: '1s' }}>
          Your Smart Finance Buddy
        </p>
        
        {/* Namibian Subtitle */}
        <p className="text-lg text-brand-300 mb-8 font-medium animate-float" style={{ animationDelay: '1.2s' }}>
          Built for Namibian Budgets & Dreams
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-brand-500 h-1 rounded-full transition-all duration-3000 ease-out"
              style={{ width: isVisible ? '100%' : '0%' }}
            ></div>
          </div>
        </div>

        {/* Skip Button */}
        <button 
          onClick={() => {
            setIsAnimating(true);
            setTimeout(() => onComplete(), 500);
          }}
          className="mt-8 px-6 py-2 text-brand-300 hover:text-white border border-brand-500/50 rounded-full transition-all duration-300 hover:bg-brand-500/20"
        >
          Skip
        </button>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-gray-400 text-sm mb-1">
          © 2025 MoolaBuddy
        </div>
        <div className="text-gray-500 text-xs">
          Empowering Financial Freedom in Namibia
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 