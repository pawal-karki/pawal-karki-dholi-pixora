import React from "react";

/**
 * Editor layout - bypasses the main subaccount layout
 * to provide a full-screen editing experience without sidebar/navigation.
 */
const EditorLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <>{children}</>;
};

export default EditorLayout;
