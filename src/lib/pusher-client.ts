import PusherClient from "pusher-js";

// Lazy-init Pusher client to avoid crashing if env vars are missing during SSR
let _pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!_pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      console.warn("[Pusher] Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER");
      // Return a dummy to avoid crashes — real-time won't work but app won't break
      return new PusherClient("dummy", { cluster: "mt1" });
    }
    _pusherClient = new PusherClient(key, { cluster });
  }
  return _pusherClient;
}

// Keep backward-compatible export (lazy getter)
export const pusherClient = new Proxy({} as PusherClient, {
  get(_target, prop) {
    const client = getPusherClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
