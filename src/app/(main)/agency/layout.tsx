import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Gradient Background - Green color scheme */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 100%, rgba(5, 150, 105, 0.4), transparent),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16, 185, 129, 0.35), transparent),
            radial-gradient(ellipse 50% 30% at 90% 60%, rgba(20, 184, 166, 0.3), transparent),
            linear-gradient(to bottom, #0a0a0f 0%, #0d0d14 100%)
          `,
        }}
      />

      {/* Subtle noise overlay for depth */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4">
        {children}
      </div>
    </div>
  );
}

