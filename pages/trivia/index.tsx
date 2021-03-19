import { PusherProvider } from "@harelpls/use-pusher";
import RoomService from "../../components/roomService";
import TriviaView from "../../views/trivia";

const config = {
  clientKey: "5d3a6dfd9bbec762d06a",
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
