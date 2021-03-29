import { PusherProvider } from "@harelpls/use-pusher";
import { config } from "../../lib/pusher";
import RandomView from "../../views/random";

export default function Random() {
  return (
    <PusherProvider {...config}>
      <RandomView />
    </PusherProvider>
  );
}
