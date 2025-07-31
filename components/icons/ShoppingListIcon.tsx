import React from 'react';

const ShoppingListIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <path d="M9 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4" />
      <path d="M16 5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5z" />
      <path d="M12 2v4" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </svg>
  );
};

export default ShoppingListIcon; 