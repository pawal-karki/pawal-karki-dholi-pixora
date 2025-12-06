"use client";

import React from "react";

const Loading = () => {
  return (
    <div className="relative flex items-center justify-center" role="status">
      {/* Outer glow ring */}
      <div className="absolute w-12 h-12 rounded-full border-2 border-primary/20 animate-ping" />

      {/* Main spinner */}
      <div className="relative w-10 h-10">
        {/* Spinning gradient ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              hsl(168 85% 45%) 90deg,
              hsl(168 70% 50%) 180deg,
              transparent 270deg
            )`,
            maskImage: "radial-gradient(transparent 55%, black 56%)",
            WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)",
          }}
        />

        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Variant with dots animation
export const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1" role="status">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: "600ms",
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Variant with pulsing ring
export const LoadingPulse = () => {
  return (
    <div
      className="relative flex items-center justify-center w-10 h-10"
      role="status"
    >
      {/* Multiple expanding rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-ring"
          style={{ animationDelay: `${i * 500}ms` }}
        />
      ))}
      {/* Center dot */}
      <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Variant with orbital animation
export const LoadingOrbital = () => {
  return (
    <div className="relative w-10 h-10" role="status">
      {/* Static ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />

      {/* Orbiting dot */}
      <div
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: "1.2s" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/60">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
        </div>
      </div>

      {/* Center indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Variant with bars animation
export const LoadingBars = () => {
  return (
    <div className="flex items-end gap-1 h-6" role="status">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full h-full animate-loading-bars"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
