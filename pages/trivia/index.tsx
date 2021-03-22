import { PusherProvider, PusherProviderProps } from "@harelpls/use-pusher";
import RoomService from "../../components/roomService";
import TriviaView from "../../views/trivia";

const config: PusherProviderProps = {
  clientKey: process.env.PUSHER_CLIENT_KEY,
  cluster: "eu",
};

export default function Trivia() {
  return (
    <PusherProvider {...config}>
      <RoomService>
        <TriviaView />
      </RoomService>
    </PusherProvider>
  );
}
