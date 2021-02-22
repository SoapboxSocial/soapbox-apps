import { RoomServiceProvider } from "@roomservice/react";
import Spinner from "../../components/spinner";
import { useSession } from "../../hooks";
import { AuthFunction } from "../../lib/roomservice";
import PollsView from "../../views/polls";

export default function Polls() {
  const user = useSession();

  return (
    <RoomServiceProvider
      online={user !== null}
      clientParameters={{
        auth: AuthFunction,
        ctx: {
          userID: String(user?.id),
        },
      }}
    >
      {user?.id ? (
        <main className="flex flex-col min-h-screen">
          <PollsView />
        </main>
      ) : (
        <main className="min-h-screen flex flex-col items-center justify-center">
          <Spinner />
        </main>
      )}
    </RoomServiceProvider>
  );
}
