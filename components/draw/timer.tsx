import { useEffect, useState } from "react";
import { Clock } from "react-feather";
import { Socket } from "socket.io-client";
import { DrawEmitEvents, DrawListenEvents } from "../../views/draw";

const ROUND_DURATION = 80;

type Props = {
  socket: Socket<DrawListenEvents, DrawEmitEvents>;
};

export default function Timer({ socket }: Props) {
  const [timer, timerSet] = useState<number>(ROUND_DURATION);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleTimer = (timeLeft: number) => timerSet(timeLeft);

    socket.on("TIME", handleTimer);

    return () => {
      socket.off("TIME", handleTimer);
    };
  }, [socket]);

  return (
    <div className="flex items-center space-x-2">
      <Clock size={20} />

      <span className="font-bold">{timer}</span>
    </div>
  );
}
