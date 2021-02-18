import { RoomServiceProvider } from "@roomservice/react";
import { useUser } from "../../hooks";
import { AuthFunction } from "../../lib/roomservice";
import PollsView from "../../views/polls";

export default function Polls() {
  const { userID } = useUser();

  return (
    <RoomServiceProvider
      online={userID !== null}
      clientParameters={{
        auth: AuthFunction,
        ctx: {
          userID,
        },
      }}
    >
      <main className="flex flex-col min-h-screen">
        <PollsView />
      </main>
    </RoomServiceProvider>
  );
}
