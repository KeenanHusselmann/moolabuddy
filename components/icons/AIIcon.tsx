import React from 'react';

const AIIcon: React.FC = () => (
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="moola-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{stopColor: '#52c1ff', stopOpacity: 1}} />
      <stop offset="100%" style={{stopColor: '#0f8ce6', stopOpacity: 1}} />
    </linearGradient>
  </defs>
  <path d="M4 18V6L12 14L20 6V18" stroke="url(#moola-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

export default AIIcon;