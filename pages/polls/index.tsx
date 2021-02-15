import { RoomServiceProvider } from "@roomservice/react";
import { useUser } from "../../hooks";
import { AuthFunction } from "../../lib/roomservice";
import PollsView from "../../views/polls";
import styles from "../../views/polls/Polls.module.css";

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
      <main className={styles.main}>
        <PollsView />
      </main>
    </RoomServiceProvider>
  );
}
