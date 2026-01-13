export interface PricingItem {
  title: string;
  description: string;
  price: string;
  duration: string;
  highlight: string;
  features: string[];
}

export const PRICING: PricingItem[] = [
  {
    title: "Starter",
    description: "Ideal for individuals exploring Pixora",
    price: "Free",
    duration: "",
    highlight: "Included features",
    features: [
      "1 Sub-account",
      "1 Team member",
      "Basic drag-and-drop builder",
      "Publish to Pixora subdomain",
      "Limited templates",
    ],
  },
  {
    title: "Pro",
    description: "For freelancers and growing teams",
    price: "NPR 999",
    duration: "/month",
    highlight: "Everything in Starter plus",
    features: [
      "Up to 5 Sub-accounts",
      "Up to 5 Team members",
      "Custom domain deployment",
      "Advanced funnel builder",
      "CRM & lead management",
      "Access to premium templates",
    ],
  },
  {
    title: "Agency",
    description: "Complete toolkit for digital agencies",
    price: "NPR 4,999",
    duration: "/month",
    highlight: "Everything in Pro plus",
    features: [
      "Unlimited Sub-accounts",
      "Unlimited Team members",
      "White-label branding",
      "Client billing via Stripe Connect",
      "Performance analytics dashboard",
      "Priority support",
    ],
  },
];
