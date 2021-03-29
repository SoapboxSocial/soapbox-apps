import { PusherProvider } from "@harelpls/use-pusher";
import { config } from "../../lib/pusher";
import TriviaView from "../../views/trivia";

export default function Trivia() {
  return (
    <PusherProvider {...config}>
      <TriviaView />
    </PusherProvider>
  );
}
