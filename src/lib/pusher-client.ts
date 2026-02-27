import PusherClient from "pusher-js";

// Pusher client instance (used in React components for real-time subscriptions)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
