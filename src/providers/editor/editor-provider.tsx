"use client";

import type {
    DeviceTypes,
    EditorAction,
    EditorElement,
    EditorState,
    HistoryState,
} from "@/lib/types/editor";
import { FunnelPage } from "@prisma/client";
import React from "react";

const initialEditorState: EditorState["editor"] = {
    device: "Desktop",
    previewMode: false,
    liveMode: false,
    elements: [
        {
            content: [],
            id: "__body",
            name: "Body",
            styles: {},
            type: "__body",
        },
    ],
    selectedElement: {
        id: "",
        content: [],
        name: "",
        styles: {},
        type: null,
    },
    funnelPageId: "",
    mobileNavOpen: false,
    globalStyles: {
        colors: {
            primary: "#000000",
            secondary: "#ffffff",
            background: "#ffffff",
            text: "#000000",
            accent: "#3b82f6",
        },
        typography: {
            fontFamily: "Inter, sans-serif",
            headings: "Inter, sans-serif",
        },
    },
};

const initialHistoryState: HistoryState = {
    currentIndex: 0,
    history: [initialEditorState],
};

const initialState: EditorState = {
    editor: initialEditorState,
    history: initialHistoryState,
};

const addElement = (
    elements: EditorElement[],
    action: EditorAction
): EditorElement[] => {
    if (action.type !== "ADD_ELEMENT") {
        throw Error(
            "You sent the wrong action type to the Add Element editor state"
        );
    }

    // if content exists then add elementDetails via payload, if not then handle nested content recursively
    return elements.map((element) => {
        if (
            element.id === action.payload.containerId &&
            Array.isArray(element.content)
        ) {
            return {
                ...element,
                content: [...element.content, action.payload.elementDetails],
            };
        } else if (element.content && Array.isArray(element.content)) {
            return {
                ...element,
                content: addElement(element.content, action),
            };
        }

        return element;
    });
};

const updateElement = (
    elements: EditorElement[],
    action: EditorAction
): EditorElement[] => {
    if (action.type !== "UPDATE_ELEMENT") {
        throw Error(
            "You sent the wrong action type to the Update Element editor state"
        );
    }

    // if element exists then update elementDetails via payload, if not then handle nested content recursively
    return elements.map((element) => {
        if (element.id === action.payload.elementDetails.id) {
            return {
                ...element,
                ...action.payload.elementDetails,
            };
        } else if (element.content && Array.isArray(element.content)) {
            return {
                ...element,
                content: updateElement(element.content, action),
            };
        }

        return element;
    });
};

const deleteElement = (elements: EditorElement[], action: EditorAction) => {
    if (action.type !== "DELETE_ELEMENT") {
        throw Error(
            "You sent the wrong action type to the Delete Element editor state"
        );
    }

    return elements.filter((element) => {
        if (
            action.payload.elementDetails.id === "__body" &&
            element.id === "__body"
        ) {
            return true;
        }

        if (element.id === action.payload.elementDetails.id) {
            return false;
        } else if (element.content && Array.isArray(element.content)) {
            element.content = deleteElement(element.content, action);
        }

        return true;
    });
};

const findElement = (
    elements: EditorElement[],
    id: string,
): EditorElement | null => {
    for (const el of elements) {
        if (el.id === id) return el;
        if (Array.isArray(el.content)) {
            const found = findElement(el.content, id);
            if (found) return found;
        }
    }
    return null;
};

const removeElement = (
    elements: EditorElement[],
    id: string,
): EditorElement[] =>
    elements
        .filter((el) => el.id !== id)
        .map((el) =>
            Array.isArray(el.content)
                ? { ...el, content: removeElement(el.content, id) }
                : el,
        );

const insertElement = (
    elements: EditorElement[],
    containerId: string,
    element: EditorElement,
    index: number,
): EditorElement[] =>
    elements.map((el) => {
        if (el.id === containerId && Array.isArray(el.content)) {
            const newContent = [...el.content];
            const clampedIndex = Math.min(index, newContent.length);
            newContent.splice(clampedIndex, 0, element);
            return { ...el, content: newContent };
        }
        if (Array.isArray(el.content)) {
            return {
                ...el,
                content: insertElement(el.content, containerId, element, index),
            };
        }
        return el;
    });

const isDescendant = (
    elements: EditorElement[],
    parentId: string,
    childId: string,
): boolean => {
    const parent = findElement(elements, parentId);
    if (!parent || !Array.isArray(parent.content)) return false;
    for (const c of parent.content) {
        if (c.id === childId) return true;
        if (Array.isArray(c.content) && isDescendant([c], c.id, childId))
            return true;
    }
    return false;
};

const editorReducer = (
    state: EditorState = initialState,
    action: EditorAction
): EditorState => {

    switch (action.type) {
        case "ADD_ELEMENT": {
            const updatedEditor = {
                ...state.editor,
                elements: addElement(state.editor.elements, action),
            };

            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditor },
            ];

            const newEditorState: EditorState = {
                ...state,
                editor: updatedEditor,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return newEditorState;
        }
        case "UPDATE_ELEMENT": {
            const updatedElements = updateElement(state.editor.elements, action);
            const isUpdatedElementSelected =
                state.editor.selectedElement.id === action.payload.elementDetails.id;

            const updatedEditor = {
                ...state.editor,
                elements: updatedElements,
                selectedElement: isUpdatedElementSelected
                    ? action.payload.elementDetails
                    : {
                        id: "",
                        content: [],
                        name: "",
                        styles: {},
                        type: null,
                    },
            };

            const updatedHistory = [
                ...state.history.history.splice(0, state.history.currentIndex + 1),
                { ...updatedEditor },
            ];

            const newEditorState: EditorState = {
                ...state,
                editor: updatedEditor,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return newEditorState;
        }
        case "DELETE_ELEMENT": {
            const updatedElements = deleteElement(state.editor.elements, action);

            const updatedEditor = {
                ...state.editor,
                elements: updatedElements,
            };

            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditor },
            ];

            const newEditorState: EditorState = {
                ...state,
                editor: updatedEditor,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return newEditorState;
        }
        case "MOVE_ELEMENT": {
            const { elementId, newContainerId, index } = action.payload;
            if (elementId === "__body" || elementId === newContainerId) return state;
            if (isDescendant(state.editor.elements, elementId, newContainerId))
                return state;

            const movingElement = findElement(state.editor.elements, elementId);
            if (!movingElement) return state;

            const afterRemove = removeElement(state.editor.elements, elementId);
            const afterInsert = insertElement(
                afterRemove,
                newContainerId,
                movingElement,
                index,
            );

            const updatedEditor = { ...state.editor, elements: afterInsert };
            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditor },
            ];

            return {
                ...state,
                editor: updatedEditor,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };
        }
        case "CHANGE_CLICKED_ELEMENT": {
            const clickedState: EditorState = {
                ...state,
                editor: {
                    ...state.editor,
                    selectedElement: action.payload.elementDetails || {
                        id: "",
                        content: [],
                        name: "",
                        styles: {},
                        type: null,
                    },
                },
            };

            return clickedState;
        }
        case "CHANGE_DEVICE": {
            const changeDeviceState: EditorState = {
                ...state,
                editor: {
                    ...state.editor,
                    device: action.payload.device,
                    mobileNavOpen: false,
                },
            };

            return changeDeviceState;
        }
        case "TOGGLE_MOBILE_NAV": {
            return {
                ...state,
                editor: {
                    ...state.editor,
                    mobileNavOpen: !state.editor.mobileNavOpen,
                },
            };
        }
        case "TOGGLE_PREVIEW_MODE": {
            const togglePreviewState: EditorState = {
                ...state,
                editor: {
                    ...state.editor,
                    previewMode: !state.editor.previewMode,
                },
            };

            return togglePreviewState;
        }
        case "TOGGLE_LIVE_MODE": {
            const toggleLiveMode: EditorState = {
                ...state,
                editor: {
                    ...state.editor,
                    liveMode: action.payload
                        ? action.payload.value
                        : !state.editor.liveMode,
                },
            };

            return toggleLiveMode;
        }
        case "CLEAR_HISTORY": {
            return {
                ...state,
                history: {
                    ...state.history,
                    history: [],
                    currentIndex: 0,
                },
            };
        }
        case "REDO": {
            // check if current index is not the last
            if (state.history.currentIndex < state.history.history.length - 1) {
                const nextIndex = state.history.currentIndex + 1;

                const updatedEditor = {
                    ...state.history.history[nextIndex],
                };

                const newEditorState: EditorState = {
                    ...state,
                    editor: updatedEditor,
                    history: {
                        ...state.history,
                        currentIndex: nextIndex,
                    },
                };

                return newEditorState;
            }

            return state;
        }
        case "UNDO": {
            // check if current index is not the first
            if (state.history.currentIndex > 0) {
                const prevIndex = state.history.currentIndex - 1;

                const updatedEditor = {
                    ...state.history.history[prevIndex],
                };

                const newEditorState: EditorState = {
                    ...state,
                    editor: updatedEditor,
                    history: {
                        ...state.history,
                        currentIndex: prevIndex,
                        history: state.history.history.slice(0, prevIndex + 1),
                    },
                };

                return newEditorState;
            }

            return state;
        }
        case "LOAD_DATA": {
            const editorState: EditorState = {
                ...initialState,
                editor: {
                    ...initialState.editor,
                    elements: action.payload.elements || initialEditorState.elements,
                    liveMode: !!action.payload.withLive,
                },
            };

            return editorState;
        }
        case "SET_FUNNELPAGE_ID": {
            const { funnelPageId } = action.payload;

            const updatedEditor = {
                ...state.editor,
                funnelPageId,
            };

            const newEditorState = {
                ...state,
                editor: updatedEditor,
            };

            return newEditorState;
        }
        case "UPDATE_GLOBAL_STYLES": {
            const updatedEditor = {
                ...state.editor,
                globalStyles: action.payload.globalStyles,
            };

            const newEditorState: EditorState = {
                ...state,
                editor: updatedEditor,
                history: {
                    ...state.history,
                    history: [
                        ...state.history.history.slice(0, state.history.currentIndex + 1),
                        updatedEditor,
                    ],
                    currentIndex: state.history.currentIndex + 1,
                },
            };

            return newEditorState;
        }
        default: {
            return state;
        }
    }
};

export type EditorContextData = {
    device: DeviceTypes;
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
    setDevice: (device: DeviceTypes) => void;
};

export const EditorContext = React.createContext<{
    editor: EditorState;
    dispatch: React.Dispatch<EditorAction>;
    subAccountId: string;
    funnelId: string;
    pageDetails: FunnelPage | null;
}>({
    editor: initialState,
    dispatch: () => undefined,
    subAccountId: "",
    funnelId: "",
    pageDetails: null,
});

type EditorProps = {
    children: React.ReactNode;
    subAccountId: string;
    funnelId: string;
    pageDetails: FunnelPage;
};

import { CartProvider } from "@/providers/cart-provider";

const EditorProvider: React.FC<EditorProps> = ({
    children,
    funnelId,
    pageDetails,
    subAccountId,
}) => {
    const [editor, dispatch] = React.useReducer(editorReducer, initialState);

    return (
        <EditorContext.Provider
            value={{
                editor,
                dispatch,
                subAccountId,
                funnelId,
                pageDetails,
            }}
        >
            <CartProvider>
                {children}
            </CartProvider>
        </EditorContext.Provider>
    );
};

export default EditorProvider;
