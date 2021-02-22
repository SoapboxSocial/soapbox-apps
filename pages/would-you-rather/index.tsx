import { RoomServiceProvider } from "@roomservice/react";
import { useSession, useSoapboxRoomId } from "../../hooks";
import { AuthFunction } from "../../lib/roomservice";
import LoadingView from "../../views/loading";
import WouldYouRatherView from "../../views/would-you-rather";

export default function WouldYouRather() {
  const soapboxRoomId = useSoapboxRoomId();
  const user = useSession();

  const isOnline = user !== null && soapboxRoomId !== null;

  return (
    <RoomServiceProvider
      online={isOnline}
      clientParameters={{
        auth: AuthFunction,
        ctx: {
          userID: String(user?.id),
        },
      }}
    >
      {isOnline ? <WouldYouRatherView /> : <LoadingView />}
    </RoomServiceProvider>
  );
}
