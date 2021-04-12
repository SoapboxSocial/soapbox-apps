import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useSession, useSoapboxRoomId } from "../../hooks";

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

export function Canvas() {
  return (
    <div>
      <canvas></canvas>
    </div>
  );
}

enum SocketEvents {
  JOIN_GAME = "JOIN_GAME",
  CLOSE_GAME = "CLOSE_GAME",
}

function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(SERVER_BASE, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function PictionaryView() {
  const user = useSession();

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit(SocketEvents.JOIN_GAME, { user });

    return () => {
      socket.disconnect();
    };
  }, [user, socket]);

  return (
    <main className="flex flex-col min-h-screen select-none relative"></main>
  );
}
