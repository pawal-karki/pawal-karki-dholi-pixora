import { EditorElement, DeviceTypes } from "@/lib/types/editor";
import { createSaasNavbar } from "./navbar";
import { createSaasPricing } from "./pricing";
import { createSaasProducts } from "./products";
import { createSaasFooter } from "./footer";

export const TEMPLATE_GENERATORS: Record<
    string,
    (device?: DeviceTypes) => EditorElement
> = {
    template__saas_navbar: createSaasNavbar,
    template__saas_pricing: createSaasPricing,
    template__saas_products: createSaasProducts,
    template__saas_footer: createSaasFooter,
};

export { createSaasNavbar, createSaasPricing, createSaasProducts, createSaasFooter };
