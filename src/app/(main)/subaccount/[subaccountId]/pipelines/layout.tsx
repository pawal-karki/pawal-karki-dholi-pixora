import React from "react";

interface PipelinesLayoutProps extends React.PropsWithChildren {}

const PipelinesLayout: React.FC<PipelinesLayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default PipelinesLayout;

