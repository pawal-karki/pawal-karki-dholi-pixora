import React from 'react';

const Receipt = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-300 group-hover:scale-105 ${className}`}
    >
      {/* Modern receipt design */}
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Receipt lines */}
      <line
        x1="7"
        y1="7"
        x2="17"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="10"
        x2="13"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="13"
        x2="15"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="16"
        x2="12"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      {/* Perforated edge */}
      <path
        d="M4 19.5L20 19.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="1,2"
      />
      <circle
        cx="12"
        cy="20"
        r="1"
        fill="currentColor"
        fillOpacity="0.3"
      />
    </svg>
  );
};
export default Receipt;
