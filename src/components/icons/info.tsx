import React from 'react';

const Info = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-300 group-hover:scale-105 ${className}`}
    >
      {/* Modern info design */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />

      {/* Information symbol */}
      <rect
        x="11"
        y="8"
        width="2"
        height="2"
        rx="1"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <rect
        x="11"
        y="12"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
};

export default Info;
