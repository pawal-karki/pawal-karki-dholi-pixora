import type {
  Config,
  NoCodeComponentDefinition,
  NoCodeComponentEntry,
  Template,
} from "@easyblocks/core";
import { EasyblocksBackend } from "@easyblocks/core";

const makeId = (() => {
  let count = 0;
  return () => `eb_${count++}`;
})();

const resolveResponsiveValue = (
  value: any,
  deviceId: string
): any => {
  if (!value || typeof value !== "object" || !("$res" in value)) {
    return value;
  }

  const responsive = value as Record<string, any>;
  return (
    responsive[deviceId] ??
    responsive.lg ??
    responsive.md ??
    responsive.sm ??
    responsive.xs ??
    responsive.xl ??
    responsive["2xl"]
  );
};

const resolveTokenValue = (
  value: any,
  deviceId: string,
  fallback?: string
) => {
  const resolved = resolveResponsiveValue(value, deviceId);
  if (resolved && typeof resolved === "object" && "value" in resolved) {
    return resolved.value as string;
  }
  if (resolved === undefined || resolved === null || resolved === "") {
    return fallback;
  }
  return resolved;
};

const toPx = (value: any, fallback?: string) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

const shadowValues: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(15, 23, 42, 0.08)",
  md: "0 6px 18px rgba(15, 23, 42, 0.12)",
  lg: "0 14px 30px rgba(15, 23, 42, 0.18)",
};

const resolveShadow = (value?: string) =>
  shadowValues[value ?? "sm"] ?? shadowValues.sm;

const entry = (
  component: string,
  props: Record<string, any> = {}
): NoCodeComponentEntry => ({
  _component: component,
  _id: makeId(),
  ...props,
});

const textEntry = (text: string, props: Record<string, any> = {}) =>
  entry("Text", { text, ...props });
const badgeEntry = (text: string, props: Record<string, any> = {}) =>
  entry("Badge", { text, ...props });
const buttonEntry = (label: string, props: Record<string, any> = {}) =>
  entry("Button", { label, ...props });
const imageEntry = (src: string, props: Record<string, any> = {}) =>
  entry("Image", { src, ...props });
const containerEntry = (props: Record<string, any> = {}) =>
  entry("Container", props);
const cardEntry = (props: Record<string, any> = {}) => entry("Card", props);
const sectionEntry = (props: Record<string, any> = {}) =>
  entry("Section", props);

const starterTemplateEntry = (): NoCodeComponentEntry =>
  entry("Page", {
    Sections: [
      entry("Section", {
        Content: [
          entry("Container", {
            direction: "row",
            align: "center",
            justify: "space-between",
            Items: [
              entry("Text", {
                text: "Build fast, launch faster.",
                fontSize: 32,
                fontWeight: "700",
                align: "left",
              }),
              entry("Button", {
                label: "Get started",
                href: "#",
                variant: "primary",
              }),
            ],
          }),
        ],
      }),
      entry("Section", {
        Content: [
          entry("Text", {
            text: "Everything you need to publish beautiful pages without code.",
            fontSize: 18,
            fontWeight: "500",
            align: "center",
          }),
        ],
      }),
    ],
  });

const paymentsLandingTemplateEntry = (): NoCodeComponentEntry =>
  entry("Page", {
    Sections: [
      sectionEntry({
        backgroundColor: { value: "#f8fafc" },
        Content: [
          containerEntry({
            direction: "row",
            align: "center",
            justify: "space-between",
            gap: { value: "32px" },
            Items: [
              containerEntry({
                direction: "column",
                align: "flex-start",
                gap: { value: "16px" },
                Items: [
                  badgeEntry("Payments", {
                    backgroundColor: { value: "#e2e8f0" },
                    textColor: { value: "#0f172a" },
                    borderColor: { value: "#cbd5f5" },
                  }),
                  textEntry("Accept payments globally.", {
                    fontSize: 36,
                    fontWeight: "700",
                    align: "left",
                  }),
                  textEntry(
                    "Launch checkout, subscriptions, and invoicing with a modern API and ready-made UI.",
                    {
                      fontSize: 16,
                      fontWeight: "500",
                      align: "left",
                      color: { value: "#475569" },
                    }
                  ),
                  containerEntry({
                    direction: "row",
                    align: "center",
                    gap: { value: "12px" },
                    Items: [
                      buttonEntry("Start free", {
                        href: "#",
                        variant: "primary",
                        backgroundColor: { value: "#0f172a" },
                        textColor: { value: "#ffffff" },
                      }),
                      buttonEntry("View docs", {
                        href: "#",
                        variant: "outline",
                        backgroundColor: { value: "#ffffff" },
                        textColor: { value: "#0f172a" },
                        borderColor: { value: "#0f172a" },
                      }),
                    ],
                  }),
                ],
              }),
              imageEntry("https://placehold.co/520x360?text=Checkout+UI", {
                width: 520,
                radius: 24,
              }),
            ],
          }),
        ],
      }),
      sectionEntry({
        Content: [
          containerEntry({
            direction: "column",
            align: "center",
            gap: { value: "20px" },
            Items: [
              textEntry("Trusted payment rails", {
                fontSize: 22,
                fontWeight: "600",
                align: "center",
              }),
              containerEntry({
                direction: "row",
                align: "center",
                justify: "center",
                gap: { value: "24px" },
                Items: [
                  imageEntry("https://placehold.co/120x48?text=Visa", {
                    width: 120,
                    radius: 12,
                  }),
                  imageEntry("https://placehold.co/120x48?text=Mastercard", {
                    width: 120,
                    radius: 12,
                  }),
                  imageEntry("https://placehold.co/120x48?text=Apple+Pay", {
                    width: 120,
                    radius: 12,
                  }),
                  imageEntry("https://placehold.co/120x48?text=PayPal", {
                    width: 120,
                    radius: 12,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sectionEntry({
        Content: [
          containerEntry({
            direction: "column",
            align: "flex-start",
            gap: { value: "16px" },
            Items: [
              textEntry("Integrate in minutes", {
                fontSize: 24,
                fontWeight: "700",
                align: "left",
              }),
              containerEntry({
                direction: "row",
                align: "stretch",
                gap: { value: "16px" },
                Items: [
                  cardEntry({
                    Content: [
                      badgeEntry("Step 1", {
                        backgroundColor: { value: "#e0f2fe" },
                        textColor: { value: "#0f172a" },
                      }),
                      textEntry("Drop-in checkout", {
                        fontSize: 18,
                        fontWeight: "600",
                        align: "left",
                      }),
                      textEntry(
                        "Use prebuilt checkout UI with local payment methods.",
                        { fontSize: 14, color: { value: "#64748b" } }
                      ),
                    ],
                  }),
                  cardEntry({
                    Content: [
                      badgeEntry("Step 2", {
                        backgroundColor: { value: "#dcfce7" },
                        textColor: { value: "#0f172a" },
                      }),
                      textEntry("Configure rules", {
                        fontSize: 18,
                        fontWeight: "600",
                        align: "left",
                      }),
                      textEntry(
                        "Set taxes, discounts, and checkout rules in the dashboard.",
                        { fontSize: 14, color: { value: "#64748b" } }
                      ),
                    ],
                  }),
                  cardEntry({
                    Content: [
                      badgeEntry("Step 3", {
                        backgroundColor: { value: "#fee2e2" },
                        textColor: { value: "#0f172a" },
                      }),
                      textEntry("Go live", {
                        fontSize: 18,
                        fontWeight: "600",
                        align: "left",
                      }),
                      textEntry(
                        "Flip the switch and monitor payments in real time.",
                        { fontSize: 14, color: { value: "#64748b" } }
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sectionEntry({
        Content: [
          containerEntry({
            direction: "column",
            align: "flex-start",
            gap: { value: "16px" },
            Items: [
              textEntry("Pricing built for growth", {
                fontSize: 24,
                fontWeight: "700",
                align: "left",
              }),
              containerEntry({
                direction: "row",
                align: "stretch",
                gap: { value: "16px" },
                Items: [
                  cardEntry({
                    Content: [
                      textEntry("Starter", {
                        fontSize: 18,
                        fontWeight: "600",
                        align: "left",
                      }),
                      textEntry("$0 / mo", {
                        fontSize: 28,
                        fontWeight: "700",
                        align: "left",
                      }),
                      textEntry("1.9% + 30c per transaction", {
                        fontSize: 14,
                        color: { value: "#64748b" },
                      }),
                      buttonEntry("Choose Starter", {
                        href: "#",
                        variant: "outline",
                        backgroundColor: { value: "#ffffff" },
                        textColor: { value: "#0f172a" },
                        borderColor: { value: "#0f172a" },
                      }),
                    ],
                  }),
                  cardEntry({
                    Content: [
                      badgeEntry("Most popular", {
                        backgroundColor: { value: "#0f172a" },
                        textColor: { value: "#ffffff" },
                        borderColor: { value: "#0f172a" },
                      }),
                      textEntry("Scale", {
                        fontSize: 18,
                        fontWeight: "600",
                        align: "left",
                      }),
                      textEntry("$49 / mo", {
                        fontSize: 28,
                        fontWeight: "700",
                        align: "left",
                      }),
                      textEntry("1.5% + 25c per transaction", {
                        fontSize: 14,
                        color: { value: "#64748b" },
                      }),
                      buttonEntry("Choose Scale", {
                        href: "#",
                        variant: "primary",
                        backgroundColor: { value: "#0f172a" },
                        textColor: { value: "#ffffff" },
                      }),
                    ],
                  }),
                  cardEntry({
                    Content: [
                      textEntry("Enterprise", {
                        fontSize: 18,
                        fontWeight: "600",
                        align: "left",
                      }),
                      textEntry("Custom", {
                        fontSize: 28,
                        fontWeight: "700",
                        align: "left",
                      }),
                      textEntry("Custom rates, SLAs, and fraud tools", {
                        fontSize: 14,
                        color: { value: "#64748b" },
                      }),
                      buttonEntry("Talk to sales", {
                        href: "#",
                        variant: "outline",
                        backgroundColor: { value: "#ffffff" },
                        textColor: { value: "#0f172a" },
                        borderColor: { value: "#0f172a" },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sectionEntry({
        backgroundColor: { value: "#0f172a" },
        borderColor: { value: "rgba(148, 163, 184, 0.3)" },
        shadow: "none",
        Content: [
          containerEntry({
            direction: "row",
            align: "center",
            justify: "space-between",
            gap: { value: "24px" },
            Items: [
              containerEntry({
                direction: "column",
                align: "flex-start",
                gap: { value: "8px" },
                Items: [
                  textEntry("Ready to launch payments?", {
                    fontSize: 24,
                    fontWeight: "700",
                    align: "left",
                    color: { value: "#ffffff" },
                  }),
                  textEntry("Go live in days, not weeks.", {
                    fontSize: 16,
                    align: "left",
                    color: { value: "#cbd5f5" },
                  }),
                ],
              }),
              buttonEntry("Create account", {
                href: "#",
                variant: "primary",
                backgroundColor: { value: "#14b8a6" },
                textColor: { value: "#0f172a" },
              }),
            ],
          }),
        ],
      }),
    ],
  });

const pricingCheckoutTemplateEntry = (): NoCodeComponentEntry =>
  entry("Page", {
    Sections: [
      sectionEntry({
        Content: [
          containerEntry({
            direction: "column",
            align: "center",
            gap: { value: "12px" },
            Items: [
              badgeEntry("Pricing", {
                backgroundColor: { value: "#e2e8f0" },
                textColor: { value: "#0f172a" },
              }),
              textEntry("Plans for every team", {
                fontSize: 28,
                fontWeight: "700",
                align: "center",
              }),
              textEntry("Upgrade when you are ready to scale.", {
                fontSize: 16,
                color: { value: "#64748b" },
                align: "center",
              }),
            ],
          }),
        ],
      }),
      sectionEntry({
        Content: [
          containerEntry({
            direction: "row",
            align: "stretch",
            gap: { value: "16px" },
            Items: [
              cardEntry({
                Content: [
                  textEntry("Starter", {
                    fontSize: 18,
                    fontWeight: "600",
                    align: "left",
                  }),
                  textEntry("$0 / mo", {
                    fontSize: 28,
                    fontWeight: "700",
                    align: "left",
                  }),
                  textEntry("Card payments, invoices, and payouts", {
                    fontSize: 14,
                    color: { value: "#64748b" },
                  }),
                  buttonEntry("Start free", {
                    href: "#",
                    variant: "outline",
                    backgroundColor: { value: "#ffffff" },
                    textColor: { value: "#0f172a" },
                    borderColor: { value: "#0f172a" },
                  }),
                ],
              }),
              cardEntry({
                Content: [
                  badgeEntry("Best value", {
                    backgroundColor: { value: "#0f172a" },
                    textColor: { value: "#ffffff" },
                  }),
                  textEntry("Growth", {
                    fontSize: 18,
                    fontWeight: "600",
                    align: "left",
                  }),
                  textEntry("$49 / mo", {
                    fontSize: 28,
                    fontWeight: "700",
                    align: "left",
                  }),
                  textEntry("Subscriptions, tax automation, 24/7 support", {
                    fontSize: 14,
                    color: { value: "#64748b" },
                  }),
                  buttonEntry("Upgrade", {
                    href: "#",
                    variant: "primary",
                    backgroundColor: { value: "#0f172a" },
                    textColor: { value: "#ffffff" },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sectionEntry({
        backgroundColor: { value: "#f8fafc" },
        Content: [
          containerEntry({
            direction: "row",
            align: "center",
            justify: "space-between",
            gap: { value: "24px" },
            Items: [
              containerEntry({
                direction: "column",
                align: "flex-start",
                gap: { value: "8px" },
                Items: [
                  textEntry("Checkout in minutes", {
                    fontSize: 22,
                    fontWeight: "700",
                    align: "left",
                  }),
                  textEntry(
                    "Embedded checkout, hosted UI, and optimized payment routing.",
                    { fontSize: 14, color: { value: "#64748b" } }
                  ),
                ],
              }),
              buttonEntry("Start integration", {
                href: "#",
                variant: "primary",
                backgroundColor: { value: "#0f172a" },
                textColor: { value: "#ffffff" },
              }),
            ],
          }),
        ],
      }),
    ],
  });

const paymentMethodsTemplateEntry = (): NoCodeComponentEntry =>
  entry("Page", {
    Sections: [
      sectionEntry({
        Content: [
          containerEntry({
            direction: "column",
            align: "center",
            gap: { value: "16px" },
            Items: [
              textEntry("Offer the right ways to pay", {
                fontSize: 26,
                fontWeight: "700",
                align: "center",
              }),
              textEntry("Cards, wallets, bank transfer, and buy now pay later.", {
                fontSize: 16,
                color: { value: "#64748b" },
                align: "center",
              }),
              containerEntry({
                direction: "row",
                align: "center",
                justify: "center",
                gap: { value: "16px" },
                Items: [
                  imageEntry("https://placehold.co/140x56?text=Visa", {
                    width: 140,
                    radius: 12,
                  }),
                  imageEntry("https://placehold.co/140x56?text=Mastercard", {
                    width: 140,
                    radius: 12,
                  }),
                  imageEntry("https://placehold.co/140x56?text=Apple+Pay", {
                    width: 140,
                    radius: 12,
                  }),
                  imageEntry("https://placehold.co/140x56?text=Klarna", {
                    width: 140,
                    radius: 12,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

const components: Array<NoCodeComponentDefinition> = [
  {
    id: "Page",
    label: "Page",
    schema: [
      {
        prop: "backgroundColor",
        label: "Background",
        type: "color",
        defaultValue: { value: "#ffffff" },
      },
      {
        prop: "padding",
        label: "Page Padding",
        type: "space",
        defaultValue: { value: "32px" },
      },
      {
        prop: "Sections",
        label: "Sections",
        type: "component-collection",
        accepts: ["Section"],
        picker: "large",
      },
    ],
    styles: ({ values, device }) => ({
      styled: {
        Root: {
          minHeight: "100vh",
          backgroundColor: resolveTokenValue(
            values.backgroundColor,
            device.id,
            "#ffffff"
          ),
          padding: resolveTokenValue(values.padding, device.id, "32px"),
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        },
      },
    }),
  },
  {
    id: "Section",
    label: "Section",
    schema: [
      {
        prop: "backgroundColor",
        label: "Background",
        type: "color",
        defaultValue: { value: "transparent" },
      },
      {
        prop: "padding",
        label: "Padding",
        type: "space",
        defaultValue: { value: "28px" },
      },
      {
        prop: "borderColor",
        label: "Border Color",
        type: "color",
        defaultValue: { value: "rgba(15, 23, 42, 0.06)" },
      },
      {
        prop: "radius",
        label: "Radius",
        type: "number",
        defaultValue: 16,
      },
      {
        prop: "shadow",
        label: "Shadow",
        type: "select",
        params: {
          options: ["none", "sm", "md", "lg"],
        },
        defaultValue: "sm",
      },
      {
        prop: "Content",
        label: "Content",
        type: "component-collection",
        accepts: ["Container", "Text", "Button", "Image", "Card", "Badge"],
      },
    ],
    styles: ({ values, device }) => ({
      styled: {
        Root: {
          backgroundColor: resolveTokenValue(
            values.backgroundColor,
            device.id,
            "transparent"
          ),
          padding: resolveTokenValue(values.padding, device.id, "28px"),
          borderRadius: toPx(values.radius, "16px"),
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: resolveShadow(values.shadow),
          border: `1px solid ${resolveTokenValue(
            values.borderColor,
            device.id,
            "rgba(15, 23, 42, 0.06)"
          )}`,
        },
      },
    }),
  },
  {
    id: "Container",
    label: "Container",
    schema: [
      {
        prop: "direction",
        label: "Direction",
        type: "select",
        params: {
          options: ["row", "column"],
        },
        defaultValue: "column",
      },
      {
        prop: "align",
        label: "Align Items",
        type: "select",
        params: {
          options: ["flex-start", "center", "flex-end", "stretch"],
        },
        defaultValue: "flex-start",
      },
      {
        prop: "justify",
        label: "Justify",
        type: "select",
        params: {
          options: ["flex-start", "center", "flex-end", "space-between"],
        },
        defaultValue: "flex-start",
      },
      {
        prop: "gap",
        label: "Gap",
        type: "space",
        defaultValue: { value: "16px" },
      },
      {
        prop: "Items",
        label: "Items",
        type: "component-collection",
        accepts: ["Text", "Button", "Image", "Badge", "Card", "Container"],
      },
    ],
    styles: ({ values, device }) => ({
      styled: {
        Root: {
          display: "flex",
          flexDirection: values.direction || "column",
          alignItems: values.align || "flex-start",
          justifyContent: values.justify || "flex-start",
          gap: resolveTokenValue(values.gap, device.id, "16px"),
          width: "100%",
          flexWrap: "wrap",
        },
      },
    }),
  },
  {
    id: "Card",
    label: "Card",
    schema: [
      {
        prop: "backgroundColor",
        label: "Background",
        type: "color",
        defaultValue: { value: "#ffffff" },
      },
      {
        prop: "padding",
        label: "Padding",
        type: "space",
        defaultValue: { value: "20px" },
      },
      {
        prop: "borderColor",
        label: "Border Color",
        type: "color",
        defaultValue: { value: "rgba(15, 23, 42, 0.08)" },
      },
      {
        prop: "radius",
        label: "Radius",
        type: "number",
        defaultValue: 16,
      },
      {
        prop: "shadow",
        label: "Shadow",
        type: "select",
        params: {
          options: ["none", "sm", "md", "lg"],
        },
        defaultValue: "sm",
      },
      {
        prop: "Content",
        label: "Content",
        type: "component-collection",
        accepts: ["Text", "Button", "Image", "Container", "Badge"],
      },
    ],
    styles: ({ values, device }) => ({
      styled: {
        Root: {
          backgroundColor: resolveTokenValue(
            values.backgroundColor,
            device.id,
            "#ffffff"
          ),
          padding: resolveTokenValue(values.padding, device.id, "20px"),
          borderRadius: toPx(values.radius, "16px"),
          border: `1px solid ${resolveTokenValue(
            values.borderColor,
            device.id,
            "rgba(15, 23, 42, 0.08)"
          )}`,
          boxShadow: resolveShadow(values.shadow),
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        },
      },
    }),
  },
  {
    id: "Badge",
    label: "Badge",
    schema: [
      {
        prop: "text",
        label: "Text",
        type: "string",
        defaultValue: "Badge",
      },
      {
        prop: "backgroundColor",
        label: "Background",
        type: "color",
        defaultValue: { value: "#e2e8f0" },
      },
      {
        prop: "textColor",
        label: "Text Color",
        type: "color",
        defaultValue: { value: "#0f172a" },
      },
      {
        prop: "borderColor",
        label: "Border Color",
        type: "color",
        defaultValue: { value: "transparent" },
      },
      {
        prop: "padding",
        label: "Padding",
        type: "space",
        defaultValue: { value: "6px 12px" },
      },
      {
        prop: "radius",
        label: "Radius",
        type: "number",
        defaultValue: 999,
      },
      {
        prop: "fontSize",
        label: "Font Size",
        type: "number",
        defaultValue: 12,
      },
      {
        prop: "fontWeight",
        label: "Weight",
        type: "select",
        params: {
          options: ["400", "500", "600", "700"],
        },
        defaultValue: "600",
      },
    ],
    styles: ({ values, device }) => ({
      props: {
        text: values.text,
      },
      styled: {
        Root: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: resolveTokenValue(values.padding, device.id, "6px 12px"),
          borderRadius: toPx(values.radius, "999px"),
          backgroundColor: resolveTokenValue(
            values.backgroundColor,
            device.id,
            "#e2e8f0"
          ),
          color: resolveTokenValue(values.textColor, device.id, "#0f172a"),
          border: `1px solid ${resolveTokenValue(
            values.borderColor,
            device.id,
            "transparent"
          )}`,
          fontSize: toPx(values.fontSize, "12px"),
          fontWeight: values.fontWeight || "600",
          letterSpacing: "0.03em",
        },
      },
    }),
  },
  {
    id: "Text",
    label: "Text",
    schema: [
      {
        prop: "text",
        label: "Text",
        type: "string",
        defaultValue: "Text block",
      },
      {
        prop: "fontSize",
        label: "Font Size",
        type: "number",
        defaultValue: 18,
      },
      {
        prop: "fontWeight",
        label: "Weight",
        type: "select",
        params: {
          options: ["400", "500", "600", "700"],
        },
        defaultValue: "500",
      },
      {
        prop: "align",
        label: "Align",
        type: "select",
        params: {
          options: ["left", "center", "right"],
        },
        defaultValue: "left",
      },
      {
        prop: "color",
        label: "Color",
        type: "color",
        defaultValue: { value: "#0f172a" },
      },
    ],
    styles: ({ values, device }) => ({
      props: {
        text: values.text,
      },
      styled: {
        Root: {
          color: resolveTokenValue(values.color, device.id, "#0f172a"),
          fontSize: toPx(values.fontSize, "18px"),
          fontWeight: values.fontWeight || "500",
          textAlign: values.align || "left",
          lineHeight: "1.5",
        },
      },
    }),
  },
  {
    id: "Button",
    label: "Button",
    schema: [
      {
        prop: "label",
        label: "Label",
        type: "string",
        defaultValue: "Button",
      },
      {
        prop: "href",
        label: "Link",
        type: "string",
        defaultValue: "#",
      },
      {
        prop: "variant",
        label: "Variant",
        type: "select",
        params: {
          options: ["primary", "outline", "ghost"],
        },
        defaultValue: "primary",
      },
      {
        prop: "padding",
        label: "Padding",
        type: "space",
        defaultValue: { value: "14px 22px" },
      },
      {
        prop: "radius",
        label: "Radius",
        type: "number",
        defaultValue: 999,
      },
      {
        prop: "backgroundColor",
        label: "Background",
        type: "color",
        defaultValue: { value: "#0f172a" },
      },
      {
        prop: "textColor",
        label: "Text Color",
        type: "color",
        defaultValue: { value: "#ffffff" },
      },
      {
        prop: "borderColor",
        label: "Border Color",
        type: "color",
        defaultValue: { value: "#0f172a" },
      },
    ],
    styles: ({ values, device }) => {
      const variant = values.variant || "primary";
      const padding = resolveTokenValue(values.padding, device.id, "14px 22px");
      const background =
        variant === "ghost"
          ? "transparent"
          : resolveTokenValue(values.backgroundColor, device.id, "#0f172a");
      const color = resolveTokenValue(values.textColor, device.id, "#ffffff");
      const border =
        variant === "outline"
          ? `1px solid ${resolveTokenValue(
              values.borderColor,
              device.id,
              "#0f172a"
            )}`
          : "1px solid transparent";

      return {
        props: {
          label: values.label,
          href: values.href,
        },
        styled: {
          Root: {
            display: "flex",
          },
          Button: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding,
            background,
            color,
            border,
            borderRadius: toPx(values.radius, "999px"),
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.2s ease",
            boxShadow:
              variant === "primary"
                ? "0 8px 18px rgba(15, 23, 42, 0.25)"
                : "none",
          },
        },
      };
    },
  },
  {
    id: "Image",
    label: "Image",
    schema: [
      {
        prop: "src",
        label: "Image URL",
        type: "string",
        defaultValue: "https://placehold.co/1200x600?text=Image",
      },
      {
        prop: "alt",
        label: "Alt Text",
        type: "string",
        defaultValue: "Image",
      },
      {
        prop: "width",
        label: "Width",
        type: "number",
        defaultValue: 800,
      },
      {
        prop: "radius",
        label: "Radius",
        type: "number",
        defaultValue: 16,
      },
    ],
    styles: ({ values }) => ({
      props: {
        src: values.src,
        alt: values.alt,
      },
      styled: {
        Root: {
          width: toPx(values.width, "100%"),
          borderRadius: toPx(values.radius, "16px"),
          overflow: "hidden",
        },
      },
    }),
  },
];

const templates: Template[] = [
  {
    id: "starter-page",
    label: "Starter Page",
    entry: starterTemplateEntry(),
  },
  {
    id: "payments-landing",
    label: "Payments Landing",
    entry: paymentsLandingTemplateEntry(),
  },
  {
    id: "pricing-checkout",
    label: "Pricing + Checkout",
    entry: pricingCheckoutTemplateEntry(),
  },
  {
    id: "payment-methods",
    label: "Payment Methods",
    entry: paymentMethodsTemplateEntry(),
  },
];

export const createEasyblocksConfig = (accessToken: string): Config => ({
  backend: new EasyblocksBackend({
    accessToken,
  }),
  locales: [
    { code: "en-US", isDefault: true },
    { code: "de-DE", fallback: "en-US" },
  ],
  components,
  templates,
  hideCloseButton: true,
  tokens: {
    colors: [
      { id: "ink", label: "Ink", value: "#0f172a", isDefault: true },
      { id: "slate", label: "Slate", value: "#64748b" },
      { id: "white", label: "White", value: "#ffffff" },
      { id: "teal", label: "Teal", value: "#14b8a6" },
    ],
    space: [
      { id: "0", label: "0", value: "0px", isDefault: true },
      { id: "4", label: "4", value: "4px" },
      { id: "8", label: "8", value: "8px" },
      { id: "12", label: "12", value: "12px" },
      { id: "16", label: "16", value: "16px" },
      { id: "24", label: "24", value: "24px" },
      { id: "32", label: "32", value: "32px" },
      { id: "48", label: "48", value: "48px" },
      { id: "64", label: "64", value: "64px" },
      { id: "96", label: "96", value: "96px" },
    ],
  },
});
