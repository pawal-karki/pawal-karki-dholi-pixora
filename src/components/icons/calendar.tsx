import React from 'react';

const Calendar = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-300 group-hover:scale-105 ${className}`}
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="18"
        rx="3"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M2 7C2 5.34315 3.34315 4 5 4H19C20.6569 4 22 5.34315 22 7V10H2V7Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2C7.55228 2 8 2.44772 8 3V5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5V3C6 2.44772 6.44772 2 7 2Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 2C17.5523 2 18 2.44772 18 3V5C18 5.55228 17.5523 6 17 6C16.4477 6 16 5.55228 16 5V3C16 2.44772 16.4477 2 17 2Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
};

export default Calendar;
