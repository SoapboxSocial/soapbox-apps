import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { WerewolfEmitEvents, WerewolfListenEvents } from "./shared";

const ROUND_DURATION = 60 * 1.5;

export function Timer({
  socket,
}: {
  socket: Socket<WerewolfListenEvents, WerewolfEmitEvents>;
}) {
  const [timer, timerSet] = useState<number>(ROUND_DURATION);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleTime = (data: number) => {
      console.log("Received 'TIME' event", data);

      timerSet(data);
    };

    socket.on("TIME", handleTime);

    return () => {
      socket.off("TIME", handleTime);
    };
  }, [socket]);

  return (
    <div className="absolute top-0 right-0 left-0">
      <div
        style={{ width: `${(timer / ROUND_DURATION) * 100}%` }}
        className="h-1 bg-soapbox"
      />
    </div>
  );
}
