import { RoomServiceProvider } from "@roomservice/react";
import { useSession } from "../../hooks";
import { AuthFunction } from "../../lib/roomservice";
import PollsView from "../../views/polls";

export default function Polls() {
  const user = useSession();

  console.log({ user });

  return (
    <RoomServiceProvider
      online={user?.id !== null}
      clientParameters={{
        auth: AuthFunction,
        ctx: {
          userID: user?.id,
        },
      }}
    >
      <main className="flex flex-col min-h-screen">
        <PollsView />
      </main>
    </RoomServiceProvider>
  );
}
