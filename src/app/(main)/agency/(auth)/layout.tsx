import React from "react";

export default function AuthFormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

