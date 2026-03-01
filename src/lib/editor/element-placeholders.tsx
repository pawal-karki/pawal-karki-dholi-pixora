import {
  ContactFormPlaceholder,
  ContainerPlaceholder,
  ImagePlaceholder,
  LinkPlaceholder,
  PaymentFormPlaceholder,
  TextPlaceholder,
  ThreeColumnsPlaceholder,
  TwoColumnsPlaceholder,
  VideoPlaceholder,
  SectionPlaceholder,
  SaasNavbarPlaceholder,
  SaasFooterPlaceholder,
  SaasPricingPlaceholder,
  SaasProductsPlaceholder,
  ShopSectionPlaceholder,
  ProductPlaceholder,
  ProductGridPlaceholder,
  CartPlaceholder,
  CustomHtmlPlaceholder,
} from "@/components/modules/editor/editor-tabs/components-tab/placeholders";
import { EditorBtns } from "../types/editor";

type ComponentElement = {
  placeholder: React.ReactNode;
  label: string;
  id: EditorBtns | string;
  group: "layout" | "elements" | "templates" | "ecommerce";
};

export const ELEMENT_LAYOUT_PLACEHOLDERS: ComponentElement[] = [
  {
    placeholder: <SectionPlaceholder />,
    label: "Section",
    id: "section",
    group: "layout",
  },
  {
    placeholder: <ContainerPlaceholder />,
    label: "Container",
    id: "container",
    group: "layout",
  },
  {
    placeholder: <TwoColumnsPlaceholder />,
    label: "2 Columns",
    id: "2Col",
    group: "layout",
  },
  {
    placeholder: <ThreeColumnsPlaceholder />,
    label: "3 Columns",
    id: "3Col",
    group: "layout",
  },
];

export const ELEMENT_PRIMITIVE_PLACEHOLDERS: ComponentElement[] = [
  {
    placeholder: <TextPlaceholder />,
    label: "Text",
    id: "text",
    group: "elements",
  },

  {
    placeholder: <ImagePlaceholder />,
    label: "Image",
    id: "image",
    group: "elements",
  },
  {
    placeholder: <VideoPlaceholder />,
    label: "Video",
    id: "video",
    group: "elements",
  },
  {
    placeholder: <LinkPlaceholder />,
    label: "Link",
    id: "link",
    group: "elements",
  },

  {
    placeholder: <ContactFormPlaceholder />,
    label: "Contact",
    id: "contactForm",
    group: "elements",
  },
  {
    placeholder: <PaymentFormPlaceholder />,
    label: "Payment",
    id: "paymentForm",
    group: "elements",
  },
  {
    placeholder: <CustomHtmlPlaceholder />,
    label: "Custom HTML",
    id: "customHtml",
    group: "elements",
  },
];

export const ECOMMERCE_PLACEHOLDERS: ComponentElement[] = [
  {
    placeholder: <ProductGridPlaceholder />,
    label: "Products",
    id: "productGrid",
    group: "ecommerce",
  },
  {
    placeholder: <CartPlaceholder />,
    label: "Cart",
    id: "cart",
    group: "ecommerce",
  },
];

export const TEMPLATE_SECTION_PLACEHOLDERS: ComponentElement[] = [
  {
    placeholder: <SaasNavbarPlaceholder />,
    label: "Modern Navbar",
    id: "template__modern_navbar",
    group: "templates",
  },
  {
    placeholder: <SaasFooterPlaceholder />,
    label: "Modern Footer",
    id: "template__modern_footer",
    group: "templates",
  },
  {
    placeholder: <SaasProductsPlaceholder />,
    label: "Products",
    id: "template__modern_products",
    group: "templates",
  },
  {
    placeholder: <ShopSectionPlaceholder />,
    label: "Shop Page",
    id: "template__shop_section",
    group: "templates",
  },
];
