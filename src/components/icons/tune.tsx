import React from 'react';

const Tune = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-300 group-hover:scale-105 ${className}`}
    >
      {/* Modern equalizer bars */}
      <rect
        x="3"
        y="4"
        width="2"
        height="16"
        rx="1"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <rect
        x="7"
        y="8"
        width="2"
        height="8"
        rx="1"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <rect
        x="11"
        y="6"
        width="2"
        height="12"
        rx="1"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <rect
        x="15"
        y="10"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <rect
        x="19"
        y="7"
        width="2"
        height="10"
        rx="1"
        fill="currentColor"
        fillOpacity="0.5"
      />

      {/* Subtle connecting lines for equalizer effect */}
      <path
        d="M5 6L7 8"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M9 10L11 8"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M13 10L15 12"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M17 10L19 9"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Tune;
