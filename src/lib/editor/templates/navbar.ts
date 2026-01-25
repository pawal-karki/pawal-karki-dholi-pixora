import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { TOKENS } from "./tokens";
import { r, section, container, text, link, genId } from "./utils";

export const createSaasNavbar = (
  device: DeviceTypes = "Desktop"
): EditorElement => {
  const navShellPadding = r(device, "16px 16px", "20px 24px", "20px 32px");

  const navLayoutStyles = {
    width: "100%",
    maxWidth: "1200px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: r(device, "12px", "14px", "16px"),
    marginLeft: "auto",
    marginRight: "auto",
  };

  const logoElement: EditorElement = {
    id: genId(),
    name: "Company Logo",
    type: "image",
    styles: {
      width: r(device, "120px", "140px", "160px"),
      maxWidth: "100%",
      height: r(device, "30px", "34px", "36px"),
      objectFit: "contain",
      flexShrink: 0,
    },
    content: {
      src: "https://placehold.co/160x40?text=Logo",
      alt: "Company logo",
    },
  };

  return section(
    "Modern Navbar",
    {
      background: TOKENS.glass,
      backdropFilter: TOKENS.backdrop,
      WebkitBackdropFilter: TOKENS.backdrop,
      borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
      boxShadow: TOKENS.shadowSoft,
      position: "sticky",
      top: "0px",
      zIndex: "100",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      padding: navShellPadding,
    },
    "",
    [
      container("Nav Layout", navLayoutStyles, "", [
        container(
          "Brand",
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: r(device, "8px", "10px", "12px"),
            flex: "1 1 220px",
            minWidth: "200px",
          },
          "",
          [
            logoElement,
            text(
              "Brand Name",
              {
                fontWeight: "800",
                color: TOKENS.text,
                letterSpacing: "-0.6px",
                background: TOKENS.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: r(device, "18px", "20px", "24px"),
                lineHeight: "1.1",
              },
              "",
              "Your Brand"
            ),
          ]
        ),
        container(
          "Nav Links",
          {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: r(device, "8px", "10px", "12px"),
            padding: r(device, "8px", "8px", "8px"),
            background: "rgba(15, 23, 42, 0.04)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: "999px",
            flex: "2 1 320px",
            minWidth: "240px",
          },
          "",
          [
            link(
              "Home",
              {
                color: TOKENS.text,
                textDecoration: "none",
                fontWeight: "600",
                transition: TOKENS.transition,
                background: "#ffffff",
                boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.15)",
                textAlign: "center",
                minWidth: "84px",
                fontSize: "14px",
                padding: r(device, "8px 20px", "8px 20px", "8px 20px"),
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "",
              "/",
              "Home"
            ),
            link(
              "Features",
              {
                color: TOKENS.muted,
                textDecoration: "none",
                fontWeight: "500",
                transition: TOKENS.transition,
                textAlign: "center",
                minWidth: "84px",
                fontSize: "14px",
                padding: r(device, "8px 20px", "8px 20px", "8px 20px"),
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "",
              "#features",
              "Features"
            ),
            link(
              "Pricing",
              {
                color: TOKENS.muted,
                textDecoration: "none",
                fontWeight: "500",
                transition: TOKENS.transition,
                textAlign: "center",
                minWidth: "84px",
                fontSize: "14px",
                padding: r(device, "8px 20px", "8px 20px", "8px 20px"),
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "",
              "#pricing",
              "Pricing"
            ),
          ]
        ),
        container(
          "Nav Actions",
          {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: r(device, "8px", "10px", "12px"),
            flex: "1 1 220px",
            minWidth: "200px",
            marginLeft: "auto",
          },
          "",
          [
            link(
              "Login",
              {
                color: TOKENS.accent,
                textDecoration: "none",
                fontWeight: "600",
                transition: TOKENS.transition,
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                textAlign: "center",
                minWidth: "110px",
                fontSize: "14px",
                padding: r(device, "10px 20px", "10px 20px", "10px 20px"),
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "",
              "/sign-in",
              "Log in"
            ),
            link(
              "Get Started",
              {
                background: TOKENS.primaryGradient,
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: "600",
                transition: TOKENS.transition,
                boxShadow: "0 8px 16px -6px rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center",
                minWidth: "140px",
                fontSize: "14px",
                padding: r(device, "12px 24px", "12px 24px", "12px 24px"),
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              },
              "",
              "/sign-up",
              "Get Started"
            ),
          ]
        ),
      ]),
    ]
  );
};
