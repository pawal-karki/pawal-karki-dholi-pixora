import { v4 as uuidv4 } from "uuid";
import { defaultStyles } from "@/config/editor";
import { EditorAction, EditorBtns } from "../types/editor";
import { TEMPLATE_GENERATORS } from "./template-definitions";
import { ICON_SVG_MAP } from "./icon-svg-map";

export const addVerifyElement = (
  componentType: EditorBtns,
  id: string,
  dispatch: (value: EditorAction) => void,
  device: "Desktop" | "Mobile" | "Tablet" = "Desktop",
  extraData?: { imageUrl?: string; imageName?: string; html?: string; css?: string; iconName?: string }
) => {
  // Handle template types (EditorElement-based generators)
  if (typeof componentType === "string" && componentType.startsWith("template__") && !componentType.startsWith("template__html__")) {
    const generator = TEMPLATE_GENERATORS[componentType];
    if (generator) {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: generator(device),
        },
      });
      return;
    }
  }

  // Handle raw HTML/CSS template injection
  // These are stored externally and passed via extraData.html + extraData.css
  if (typeof componentType === "string" && componentType.startsWith("template__html__")) {
    dispatch({
      type: "ADD_ELEMENT",
      payload: {
        containerId: id,
        elementDetails: {
          content: {
            html: extraData?.html || "<div>HTML Template</div>",
            css: extraData?.css || "",
          },
          id: uuidv4(),
          name: extraData?.imageName || "HTML Block",
          styles: { width: "100%" },
          type: "customHtml",
        },
      },
    });
    return;
  }

  if ((componentType as string) === "icon" && extraData?.iconName) {
    const svgMarkup = ICON_SVG_MAP[extraData.iconName];
    if (svgMarkup) {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              html: svgMarkup,
              css: "",
            },
            id: uuidv4(),
            name: `Icon – ${extraData.iconName}`,
            styles: {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000000",
              width: "24px",
              height: "24px",
            },
            type: "customHtml",
          },
        },
      });
      return;
    }
  }

  switch (componentType) {
    case "text": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              innerText: "Text Element",
            },
            id: uuidv4(),
            name: "Text",
            type: "text",
            styles: {
              color: "black",
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "image": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              src: extraData?.imageUrl || "https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg",
              alt: extraData?.imageName || "Image description",
            },
            id: uuidv4(),
            name: extraData?.imageName || "Image",
            type: "image",
            styles: {
              color: "black",
              width: "100%",
              height: "auto",
              aspectRatio: "auto",
              marginLeft: "auto",
              marginRight: "auto",
              objectFit: "contain",
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "section": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: uuidv4(),
            name: "Section",
            type: "section",
            styles: {
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "container": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [],
            id: uuidv4(),
            name: "Container",
            type: "container",
            styles: {
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "link": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              innerText: "Link Element",
              href: "#",
            },
            id: uuidv4(),
            name: "Link",
            styles: {
              color: "black",
              ...defaultStyles,
            },
            type: "link",
          },
        },
      });

      break;
    }
    case "video": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              src: "https://www.youtube.com/embed/so1_VXaGqmM?si=2lBxVOuA57XMv0JX",
            },
            id: uuidv4(),
            name: "Video",
            styles: {},
            type: "video",
          },
        },
      });

      break;
    }
    case "contactForm": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              formTitle: "Want a free quote? We can help you",
              formDescription: "Get in touch",
              formButton: "Submit",
            },
            id: uuidv4(),
            name: "Contact Form",
            styles: {},
            type: "contactForm",
          },
        },
      });

      break;
    }
    case "paymentForm": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [],
            id: uuidv4(),
            name: "Payment",
            styles: {},
            type: "paymentForm",
          },
        },
      });

      break;
    }
    case "2Col": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: uuidv4(),
            name: "Two Columns",
            styles: { ...defaultStyles, display: "flex" },
            type: "2Col",
          },
        },
      });

      break;
    }
    case "3Col": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: uuidv4(),
            name: "Three Columns",
            styles: { ...defaultStyles, display: "flex" },
            type: "3Col",
          },
        },
      });

      break;
    }
    case "productGrid": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [],
            id: uuidv4(),
            name: "Products",
            styles: {
              ...defaultStyles,
              padding: "20px",
            },
            type: "productGrid",
          },
        },
      });

      break;
    }
    case "cart": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [],
            id: uuidv4(),
            name: "Shopping Cart",
            styles: {
              ...defaultStyles,
              padding: "20px",
              maxWidth: "500px",
            },
            type: "cart",
          },
        },
      });

      break;
    }
    case "customHtml": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              html: "<div style=\"padding:20px;background:#f3f4f6;border-radius:8px;\"><h2 style=\"margin:0 0 8px;font-size:18px;\">Custom HTML Block</h2><p style=\"margin:0;color:#6b7280;\">Edit your HTML in the settings panel</p></div>",
              css: "",
            },
            id: uuidv4(),
            name: "Custom HTML",
            styles: { width: "100%" },
            type: "customHtml",
          },
        },
      });

      break;
    }
  }
};
