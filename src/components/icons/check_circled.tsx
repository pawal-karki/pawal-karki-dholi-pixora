import React from 'react';

const CheckCircle = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-slate-500 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-300 group-hover:scale-105 ${className}`}
    >
      {/* Modern checkmark in circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M8 12L11 15L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fillOpacity="0.8"
      />
    </svg>
  );
};

export default CheckCircle;
