import Stripe from "stripe";

export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    // Lazy initialization
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
    return stripeClient[prop as keyof Stripe];
  },
});

