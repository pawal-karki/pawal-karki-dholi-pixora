import { v4 as uuidv4 } from "uuid";
import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./templates/tokens";
import { r, section, container, text, link } from "./templates/utils";
import { createSaasFooter } from "./templates/footer";
import { createSaasNavbar } from "./templates/navbar";

/**
 * ULTRA-MODERN RESPONSIVE Template Section Definitions
 * Optimized for 420px (Mobile) and 850px (Tablet) Editor widths.
 */

const genId = () => uuidv4();

/**
 * Ultra Modern Navbar
 * Responsive: Adapts layout for Mobile/Tablet/Desktop
 */
export const createModernNavbar = (
    device: DeviceTypes = "Desktop"
): EditorElement => createSaasNavbar(device);

/**
 * Ultra Modern Footer
 * Responsive: Columns stack on mobile.
 */
export const createModernFooter = (
    device: DeviceTypes = "Desktop"
): EditorElement => createSaasFooter(device);

/**
 * Ultra Modern Product Grid
 * Responsive: 1 Col (Mobile) -> 2 Col (Tablet) -> 3 Col (Desktop)
 */
export const createModernProducts = (
    device: DeviceTypes = "Desktop"
): EditorElement => ({
    id: genId(),
    name: "Ultra Products",
    type: "section",
    styles: {
        padding: r(device, "80px 20px", "100px 32px", "120px 40px"),
        background: TOKENS.bgGradient,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    content: [
        {
            id: genId(),
            name: "Header",
            type: "container",
            styles: {
                textAlign: "center",
                maxWidth: "700px",
                marginBottom: r(device, "60px", "70px", "80px"),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: r(device, "14px", "15px", "16px"),
            },
            content: [
                {
                    id: genId(),
                    name: "Pill Badge",
                    type: "text",
                    styles: {
                        fontSize: r(device, "11px", "11px", "12px"),
                        fontWeight: "700",
                        color: TOKENS.accent,
                        background: TOKENS.accentBg,
                        padding: r(device, "6px 16px", "7px 18px", "8px 20px"),
                        borderRadius: "100px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    },
                    content: { innerText: "Summer Collection" },
                },
                {
                    id: genId(),
                    name: "Title",
                    type: "text",
                    styles: {
                        fontSize: r(device, "36px", "42px", "48px"),
                        fontWeight: "800",
                        color: TOKENS.text,
                        letterSpacing: "-1px",
                        lineHeight: "1.1",
                        wordBreak: "break-word",
                    },
                    content: { innerText: "Curated for You" },
                },
                {
                    id: genId(),
                    name: "Subtitle",
                    type: "text",
                    styles: {
                        fontSize: r(device, "16px", "17px", "18px"),
                        color: TOKENS.muted,
                        lineHeight: "1.6",
                    },
                    content: {
                        innerText:
                            "Discover our latest arrivals, crafted with precision and designed for elegance.",
                    },
                },
            ],
        },
        {
            id: genId(),
            name: "Grid",
            type: "container",
            styles: {
                display: "flex",
                flexWrap: "wrap",
                gap: r(device, "30px", "35px", "40px"),
                maxWidth: "1280px",
                width: "100%",
                paddingBottom: r(device, "30px", "35px", "40px"),
                justifyContent: "center",
            },
            content: Array(3)
                .fill(null)
                .map((_, i) => ({
                    id: genId(),
                    name: `Card ${i + 1}`,
                    type: "container",
                    styles: {
                        background: TOKENS.bg,
                        borderRadius: r(device, "20px", "22px", "24px"),
                        border: TOKENS.border,
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: TOKENS.shadowCard,
                        overflow: "hidden",
                        transition: TOKENS.transition,
                        height: "100%",
                        flex: "1 1 300px",
                        minWidth: r(device, "280px", "290px", "290px"),
                        maxWidth: "400px",
                    },
                    content: [
                        {
                            id: genId(),
                            name: "Image Area",
                            type: "container",
                            styles: {
                                position: "relative",
                                width: "100%",
                                height: r(device, "280px", "300px", "320px"),
                                background: TOKENS.bgSecondary,
                                overflow: "hidden",
                            },
                            content: [
                                {
                                    id: genId(),
                                    name: "Product Img",
                                    type: "image",
                                    styles: {
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transition: "transform 0.5s ease",
                                    },
                                    content: {
                                        src: `https://images.unsplash.com/photo-${i === 0 ? "1523275335684-37898b6baf30" : i === 1 ? "1505740420926-4d51c890204c" : "1542291026-7eec264c27ff"}?auto=format&fit=crop&w=800&q=80`,
                                        alt: "Product",
                                    },
                                },
                                {
                                    id: genId(),
                                    name: "Tag",
                                    type: "text",
                                    styles: {
                                        position: "absolute",
                                        top: r(device, "16px", "18px", "20px"),
                                        right: r(device, "16px", "18px", "20px"),
                                        background: "rgba(255, 255, 255, 0.9)",
                                        backdropFilter: "blur(8px)",
                                        padding: r(device, "5px 12px", "5px 13px", "6px 14px"),
                                        borderRadius: "100px",
                                        fontSize: r(device, "11px", "11px", "12px"),
                                        fontWeight: "700",
                                        color: TOKENS.text,
                                    },
                                    content: { innerText: "NEW" },
                                },
                            ],
                        },
                        {
                            id: genId(),
                            name: "Details",
                            type: "container",
                            styles: {
                                padding: r(device, "24px", "28px", "32px"),
                                display: "flex",
                                flexDirection: "column",
                                gap: r(device, "14px", "15px", "16px"),
                                flex: "1",
                            },
                            content: [
                                {
                                    id: genId(),
                                    name: "Prod Name",
                                    type: "text",
                                    styles: {
                                        fontSize: r(device, "18px", "19px", "20px"),
                                        fontWeight: "700",
                                        color: TOKENS.text,
                                    },
                                    content: {
                                        innerText: [
                                            "Classic Chronograph",
                                            "Studio Headphones",
                                            "Urban Runners",
                                        ][i],
                                    },
                                },
                                {
                                    id: genId(),
                                    name: "Price Row",
                                    type: "container",
                                    styles: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: r(device, "10px", "11px", "12px"),
                                    },
                                    content: [
                                        {
                                            id: genId(),
                                            name: "Price",
                                            type: "text",
                                            styles: {
                                                fontSize: r(device, "20px", "22px", "24px"),
                                                fontWeight: "700",
                                                color: TOKENS.text,
                                            },
                                            content: { innerText: ["$199", "$249", "$129"][i] },
                                        },
                                        {
                                            id: genId(),
                                            name: "Old Price",
                                            type: "text",
                                            styles: {
                                                fontSize: r(device, "14px", "15px", "16px"),
                                                color: TOKENS.muted,
                                                textDecoration: "line-through",
                                            },
                                            content: { innerText: ["$250", "$299", "$160"][i] },
                                        },
                                    ],
                                },
                                {
                                    id: genId(),
                                    name: "Add Cart Btn",
                                    type: "link",
                                    styles: {
                                        width: "100%",
                                        padding: r(device, "14px", "15px", "16px"),
                                        background: TOKENS.primary,
                                        color: "#ffffff",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        textDecoration: "none",
                                        fontWeight: "600",
                                        fontSize: r(device, "14px", "14px", "15px"),
                                        marginTop: "auto",
                                        transition: TOKENS.transition,
                                    },
                                    content: { href: "#add-to-cart", innerText: "Add to Cart" },
                                },
                            ],
                        },
                    ],
                })),
        },
    ],
});

/**
 * E-commerce Shop Section
 * Combines Product Grid (left/main) and Cart (right/sidebar)
 * Responsive: Stacks on mobile
 */
export const createShopSection = (
    device: DeviceTypes = "Desktop"
): EditorElement => ({
    id: genId(),
    name: "Shop Section",
    type: "section",
    styles: {
        padding: r(device, "40px 16px", "60px 24px", "80px 40px"),
        background: TOKENS.bgGradient,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
    },
    content: [
        // Header
        {
            id: genId(),
            name: "Shop Header",
            type: "container",
            styles: {
                textAlign: "center",
                maxWidth: "600px",
                marginBottom: r(device, "40px", "50px", "60px"),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
            },
            content: [
                {
                    id: genId(),
                    name: "Badge",
                    type: "text",
                    styles: {
                        fontSize: "11px",
                        fontWeight: "700",
                        color: TOKENS.accent,
                        background: TOKENS.accentBg,
                        padding: "6px 16px",
                        borderRadius: "100px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    },
                    content: { innerText: "🛍️ Shop" },
                },
                {
                    id: genId(),
                    name: "Title",
                    type: "text",
                    styles: {
                        fontSize: r(device, "32px", "38px", "44px"),
                        fontWeight: "800",
                        color: TOKENS.text,
                        letterSpacing: "-1px",
                        lineHeight: "1.1",
                    },
                    content: { innerText: "Our Products" },
                },
                {
                    id: genId(),
                    name: "Subtitle",
                    type: "text",
                    styles: {
                        fontSize: r(device, "15px", "16px", "17px"),
                        color: TOKENS.muted,
                        lineHeight: "1.6",
                    },
                    content: { innerText: "Browse and add items to your cart" },
                },
            ],
        },
        // Main Layout: Products + Cart
        {
            id: genId(),
            name: "Shop Layout",
            type: "container",
            styles: {
                display: "flex",
                flexDirection: r(device, "column", "column", "row"),
                gap: r(device, "24px", "30px", "40px"),
                maxWidth: "1400px",
                width: "100%",
                alignItems: r(device, "stretch", "stretch", "flex-start"),
            },
            content: [
                // Products Area
                {
                    id: genId(),
                    name: "Products Area",
                    type: "container",
                    styles: {
                        flex: r(device, "1", "1", "1 1 70%"),
                        minWidth: "0",
                    },
                    content: [
                        {
                            id: genId(),
                            name: "Products",
                            type: "productGrid",
                            styles: {
                                padding: "0",
                            },
                            content: [],
                        },
                    ],
                },
                // Cart Sidebar
                {
                    id: genId(),
                    name: "Cart Sidebar",
                    type: "container",
                    styles: {
                        flex: r(device, "1", "1", "0 0 380px"),
                        position: r(device, "relative", "relative", "sticky"),
                        top: r(device, "0", "0", "100px"),
                        alignSelf: "flex-start",
                    },
                    content: [
                        {
                            id: genId(),
                            name: "Shopping Cart",
                            type: "cart",
                            styles: {
                                padding: "0",
                                maxWidth: "100%",
                            },
                            content: [],
                        },
                    ],
                },
            ],
        },
    ],
});

export const TEMPLATE_GENERATORS: Record<
    string,
    (device: DeviceTypes) => EditorElement
> = {
    template__modern_navbar: createModernNavbar,
    template__modern_footer: createModernFooter,
    template__modern_products: createModernProducts,
    template__shop_section: createShopSection,
};
