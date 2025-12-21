import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, icon, genId } from "./utils";

export const createSaasProducts = (
    device: DeviceTypes = "Desktop"
): EditorElement =>
    section(
        "Products",
        {
            padding: r(device, "60px 20px", "80px 40px", "100px 48px"),
            background: TOKENS.bgSecondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        [
            container(
                "Header",
                {
                    textAlign: "center",
                    marginBottom: r(device, "40px", "50px", "60px"),
                    maxWidth: "700px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                },
                [
                    text(
                        "Badge",
                        {
                            fontSize: r(device, "12px", "13px", "13px"),
                            fontWeight: "600",
                            color: TOKENS.accent,
                            background: TOKENS.accentBg,
                            padding: "6px 14px",
                            borderRadius: "100px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        },
                        "Featured Products"
                    ),
                    text(
                        "Title",
                        {
                            fontSize: r(device, "32px", "40px", "48px"),
                            fontWeight: "800",
                            color: TOKENS.text,
                            letterSpacing: "-1px",
                            lineHeight: "1.1",
                        },
                        "Selected Products"
                    ),
                    text(
                        "Sub",
                        {
                            fontSize: r(device, "16px", "17px", "18px"),
                            color: TOKENS.muted,
                            lineHeight: "1.7",
                            maxWidth: "600px",
                        },
                        "Explore our collection of premium items crafted with attention to detail."
                    ),
                ]
            ),

            container(
                "Product Grid",
                {
                    display: "grid",
                    gridTemplateColumns: r(
                        device,
                        "1fr",
                        "repeat(2, 1fr)",
                        "repeat(3, 1fr)"
                    ),
                    gap: r(device, "24px", "28px", "32px"),
                    width: "100%",
                    maxWidth: "1400px",
                },
                [...Array(3)].map((_, i) => {
                    const products = [
                        {
                            name: "Premium Watch",
                            price: "$129",
                            desc: "Elegant design featuring premium materials and movements.",
                            image: "1523275335684-37898b6baf30",
                        },
                        {
                            name: "Wireless Headphones",
                            price: "$89",
                            desc: "Crystal clear sound with noise cancellation technology.",
                            image: "1505740420926-4d51c890204c",
                        },
                        {
                            name: "Smart Camera",
                            price: "$199",
                            desc: "Professional photography made simple and accessible.",
                            image: "1542291026-7eec264c27ff",
                        },
                    ];
                    const product = products[i];

                    return container(
                        `Product ${i + 1}`,
                        {
                            background: "#ffffff",
                            borderRadius: "20px",
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            overflow: "hidden",
                            boxShadow: TOKENS.shadowCard,
                            display: "flex",
                            flexDirection: "column",
                            transition: TOKENS.transition,
                            position: "relative",
                        },
                        [
                            container(
                                "Img Wrap",
                                {
                                    height: r(device, "240px", "260px", "280px"),
                                    background: "#f1f5f9",
                                    position: "relative",
                                    overflow: "hidden",
                                },
                                [
                                    {
                                        id: genId(),
                                        name: "Prod Img",
                                        type: "image",
                                        styles: {
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transition: TOKENS.transition,
                                        },
                                        content: {
                                            src: `https://images.unsplash.com/photo-${product.image}?auto=format&fit=crop&w=800&q=80`,
                                            alt: product.name,
                                        },
                                    },
                                ]
                            ),
                            container(
                                "Info",
                                {
                                    padding: r(device, "20px", "24px", "28px"),
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                    flex: "1",
                                },
                                [
                                    container(
                                        "Row",
                                        {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "12px",
                                        },
                                        [
                                            text(
                                                "Name",
                                                {
                                                    fontSize: r(device, "18px", "19px", "20px"),
                                                    fontWeight: "700",
                                                    color: TOKENS.text,
                                                    lineHeight: "1.3",
                                                    flex: "1",
                                                },
                                                product.name
                                            ),
                                            text(
                                                "Price",
                                                {
                                                    fontSize: r(device, "20px", "22px", "24px"),
                                                    fontWeight: "800",
                                                    color: TOKENS.accent,
                                                    letterSpacing: "-0.5px",
                                                    whiteSpace: "nowrap",
                                                },
                                                product.price
                                            ),
                                        ]
                                    ),
                                    text(
                                        "Desc",
                                        {
                                            fontSize: r(device, "14px", "14px", "15px"),
                                            color: TOKENS.muted,
                                            lineHeight: "1.6",
                                            marginBottom: "4px",
                                        },
                                        product.desc
                                    ),

                                    // Add to Cart Button with Icon
                                    container(
                                        "Button Container",
                                        {
                                            display: "flex",
                                            gap: "8px",
                                            marginTop: "8px",
                                        },
                                        [
                                            link(
                                                "Add to Cart",
                                                {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "8px",
                                                    flex: "1",
                                                    padding: r(device, "12px 16px", "13px 18px", "14px 20px"),
                                                    background: TOKENS.accent,
                                                    color: "#ffffff",
                                                    textAlign: "center",
                                                    borderRadius: "10px",
                                                    fontSize: r(device, "13px", "14px", "14px"),
                                                    fontWeight: "600",
                                                    textDecoration: "none",
                                                    transition: TOKENS.transition,
                                                    boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.3)",
                                                },
                                                "#cart",
                                                "Add to Cart"
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                        ]
                    );
                })
            ),
        ]
    );
