import { v4 as uuidv4 } from "uuid";
import { EditorElement, DeviceTypes } from "@/lib/types/editor";

export const genId = () => uuidv4();

/** Responsive helper */
export const r = <T>(device: DeviceTypes, mobile: T, tablet: T, desktop: T) =>
    device === "Mobile" ? mobile : device === "Tablet" ? tablet : desktop;

/** Element builders */
export const section = (
    name: string,
    styles: Record<string, any>,
    className: string = "",
    content: EditorElement["content"]
): EditorElement => ({
    id: genId(),
    name,
    type: "section",
    styles,
    className,
    content,
});

export const container = (
    name: string,
    styles: Record<string, any>,
    className: string = "",
    content: EditorElement["content"]
): EditorElement => ({
    id: genId(),
    name,
    type: "container",
    styles,
    className,
    content,
});

export const text = (
    name: string,
    styles: Record<string, any>,
    className: string = "",
    innerText: string
): EditorElement => ({
    id: genId(),
    name,
    type: "text",
    styles,
    className,
    content: { innerText },
});

export const link = (
    name: string,
    styles: Record<string, any>,
    className: string = "",
    href: string,
    innerText: string
): EditorElement => ({
    id: genId(),
    name,
    type: "link",
    styles,
    className,
    content: { href, innerText },
});

export const divider = (device: DeviceTypes) =>
    container(
        "Divider",
        {
            width: "100%",
            maxWidth: "1200px",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            marginTop: r(device, "26px", "30px", "34px"),
        },
        "",
        []
    );

/** Icon helper - creates styled icon text element */
export const icon = (
    name: string,
    styles: Record<string, any>,
    className: string = "",
    iconChar: string
): EditorElement => ({
    id: genId(),
    name,
    type: "text",
    styles: {
        fontSize: "20px",
        lineHeight: "1",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...styles,
    },
    className,
    content: { innerText: iconChar },
});