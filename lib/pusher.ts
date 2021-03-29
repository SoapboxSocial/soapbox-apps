import { PusherProviderProps } from "@harelpls/use-pusher";

export const config: PusherProviderProps = {
  clientKey: process.env.NEXT_PUBLIC_PUSHER_CLIENT_KEY,
  cluster: "eu",
};
