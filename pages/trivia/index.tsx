import { PusherProvider, PusherProviderProps } from "@harelpls/use-pusher";
import TriviaView from "../../views/trivia";

const config: PusherProviderProps = {
  clientKey: process.env.NEXT_PUBLIC_PUSHER_CLIENT_KEY,
  cluster: "eu",
};

export default function Trivia() {
  return (
    <PusherProvider {...config}>
      <TriviaView />
    </PusherProvider>
  );
}
