import React from "react";
import {
    AppWindow,
    PanelBottom,
    ShoppingBag,
} from "lucide-react";

type TemplateType =
    | "template__modern_navbar"
    | "template__modern_footer"
    | "template__modern_products";

interface TemplatePlaceholderProps {
    type: TemplateType;
    icon: React.ReactNode;
    label: string;
}

const TemplatePlaceholder: React.FC<TemplatePlaceholderProps> = ({ type, icon }) => {
    const handleDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData("componentType", type);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="h-14 w-14 bg-muted/70 rounded-md p-2 flex items-center justify-center cursor-grab"
        >
            {/* cloneElement to add class if icon is valid element, or just wrap it */}
            <div className="text-muted-foreground">
                {icon}
            </div>
        </div>
    );
};

export const ModernNavbarPlaceholder: React.FC = () => (
    <TemplatePlaceholder
        type="template__modern_navbar"
        icon={<AppWindow className="w-5 h-5" />}
        label="Modern Navbar"
    />
);

export const ModernFooterPlaceholder: React.FC = () => (
    <TemplatePlaceholder
        type="template__modern_footer"
        icon={<PanelBottom className="w-5 h-5" />}
        label="Modern Footer"
    />
);

export const ModernProductsPlaceholder: React.FC = () => (
    <TemplatePlaceholder
        type="template__modern_products"
        icon={<ShoppingBag className="w-5 h-5" />}
        label="Products"
    />
);

// Keep old names for backward compatibility
export const SaasNavbarPlaceholder = ModernNavbarPlaceholder;
export const SaasFooterPlaceholder = ModernFooterPlaceholder;
export const SaasPricingPlaceholder = ModernProductsPlaceholder; // Using products as pricing placeholder
export const SaasProductsPlaceholder = ModernProductsPlaceholder;


export default TemplatePlaceholder;
