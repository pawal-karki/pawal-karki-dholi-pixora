import React from 'react';

const Send = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-300 group-hover:scale-105 group-hover:rotate-12 ${className}`}
    >
      {/* Modern paper airplane design */}
      <path
        d="M2.5 12L22 2L18 12L22 22L2.5 12Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M22 2L18 12L15 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fillOpacity="0.6"
      />
      <path
        d="M22 22L18 12L15 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fillOpacity="0.6"
      />
      {/* Tail for more dynamic look */}
      <path
        d="M2.5 12L6 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fillOpacity="0.4"
      />
      <path
        d="M2.5 12L6 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fillOpacity="0.4"
      />
    </svg>
  );
};

export default Send;
