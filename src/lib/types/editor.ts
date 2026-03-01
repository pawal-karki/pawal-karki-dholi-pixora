export type DeviceTypes = "Desktop" | "Mobile" | "Tablet";

export type EditorElement = {
    id: string;
    styles: React.CSSProperties;
    name: string;
    type: EditorBtns;
    className?: string;
    content:
    | EditorElement[]
    | {
        href?: string;
        innerText?: string;
        src?: string;
        formTitle?: string;
        formDescription?: string;
        formButton?: string;
        alt?: string;
        /** Raw HTML markup for the customHtml element */
        html?: string;
        /** Optional scoped <style> CSS for the customHtml element */
        css?: string;
    };
};

export type Editor = {
    funnelPageId: string;
    liveMode: boolean;
    elements: EditorElement[];
    selectedElement: EditorElement;
    device: DeviceTypes;
    previewMode: boolean;
    globalStyles: GlobalStyles;
};

export type HistoryState = {
    currentIndex: number;
    history: Editor[];
};

export type EditorState = {
    editor: Editor;
    history: HistoryState;
};

export type EditorBtns =
    | "text"
    | "container"
    | "section"
    | "contactForm"
    | "paymentForm"
    | "link"
    | "2Col"
    | "video"
    | "__body"
    | "image"
    | "3Col"
    | "productGrid"
    | "cart"
    | "checkout"
    | "customHtml"
    | null;

export type EditorAction =
    | {
        type: "ADD_ELEMENT";
        payload: {
            containerId: string;
            elementDetails: EditorElement;
        };
    }
    | {
        type: "UPDATE_ELEMENT";
        payload: {
            elementDetails: EditorElement;
        };
    }
    | {
        type: "DELETE_ELEMENT";
        payload: {
            elementDetails: EditorElement;
        };
    }
    | {
        type: "CHANGE_CLICKED_ELEMENT";
        payload: {
            elementDetails?:
            | EditorElement
            | {
                id: "";
                content: [];
                name: "";
                styles: {};
                type: null;
            };
        };
    }
    | {
        type: "CHANGE_DEVICE";
        payload: {
            device: DeviceTypes;
        };
    }
    | {
        type: "TOGGLE_PREVIEW_MODE";
    }
    | {
        type: "TOGGLE_LIVE_MODE";
        payload?: {
            value: boolean;
        };
    }
    | { type: "REDO" }
    | { type: "UNDO" }
    | {
        type: "LOAD_DATA";
        payload: {
            elements: EditorElement[];
            withLive: boolean;
        };
    }
    | {
        type: "CLEAR_HISTORY";
    }
    | {
        type: "SET_FUNNELPAGE_ID";
        payload: {
            funnelPageId: string;
        };
    }
    | {
        type: "UPDATE_GLOBAL_STYLES";
        payload: {
            globalStyles: GlobalStyles;
        };
    };

export type GlobalStyles = {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
    };
    typography: {
        fontFamily: string;
        headings: string;
    };
};
