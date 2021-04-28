import { onClose } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_BASE } from "../../constants";
import { useSession, useSoapboxRoomId } from "../../hooks";
import { Player, WerewolfEmitEvents, WerewolfListenEvents } from "./types";

function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<WerewolfListenEvents, WerewolfEmitEvents>>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(`${SERVER_BASE}/werewolf`, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function WerewolfView() {
  const user = useSession();

  const soapboxRoomId = useSoapboxRoomId();

  const socket = useSocket();

  const [players, playersSet] = useState<{ [key: string]: Player }>({});
  const handlePlayers = useCallback((data: { [key: string]: Player }) => {
    console.log("Received 'PLAYER' event", data);
    playersSet(data);
  }, []);

  const [act, actSet] = useState<"NIGHT" | "DAY">();
  const handleAct = useCallback((data: "NIGHT" | "DAY") => {
    console.log("Received 'ACT' event", data);
    actSet(data);
  }, []);

  const [wake, wakeSet] = useState<"WEREWOLF" | "DOCTOR" | "SEER">();
  const handleWake = useCallback((data: "WEREWOLF" | "DOCTOR" | "SEER") => {
    console.log("Received 'WAKE' event", data);
    wakeSet(data);
  }, []);

  const [sleep, sleepSet] = useState<"WEREWOLF" | "DOCTOR" | "SEER">();
  const handleSleep = useCallback((data: "WEREWOLF" | "DOCTOR" | "SEER") => {
    console.log("Received 'SLEEP' event", data);
    sleepSet(data);
  }, []);

  /**
   * Setup Listeners
   */
  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", { user });

    socket.on("PLAYERS", handlePlayers);
    socket.on("ACT", handleAct);
    socket.on("WAKE", handleWake);
    socket.on("SLEEP", handleSleep);

    return () => {
      socket.off("PLAYERS", handlePlayers);
      socket.off("ACT", handleAct);
      socket.off("WAKE", handleWake);
      socket.off("SLEEP", handleSleep);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Close Mini
   */
  useEffect(() => {
    if (soapboxRoomId && socket) {
      onClose(() => {
        socket.emit("CLOSE_GAME");
      });
    }
  }, [soapboxRoomId, socket]);

  /**
   * Derived Values
   */
  const waitingForPlayers = Object.keys(players).length < 6;

  return (
    <main className="flex flex-col min-h-screen select-none relative">
      <Stage act={act} wake={wake} sleep={sleep} />

      {waitingForPlayers && <Lobby players={players} />}
    </main>
  );
}

function Stage({
  act,
  wake,
  sleep,
}: {
  act?: "NIGHT" | "DAY";
  wake?: "WEREWOLF" | "DOCTOR" | "SEER";
  sleep?: "WEREWOLF" | "DOCTOR" | "SEER";
}) {
  if (act === "NIGHT") return <NightAct wake={wake} sleep={sleep} />;

  if (act === "DAY") return <DayAct />;

  return null;
}

function NightAct({
  wake,
  sleep,
}: {
  wake?: "WEREWOLF" | "DOCTOR" | "SEER";
  sleep?: "WEREWOLF" | "DOCTOR" | "SEER";
}) {
  if (wake === "WEREWOLF")
    return (
      <div className="p-4">
        <p className="text-center">werewolves are hunting</p>
      </div>
    );

  if (wake === "DOCTOR")
    return (
      <div className="p-4">
        <p className="text-center">the doctor is awake</p>
      </div>
    );

  if (wake === "SEER")
    return (
      <div className="p-4">
        <p className="text-center">the seer is awake</p>
      </div>
    );

  return (
    <div className="p-4">
      <p className="text-center">night decends...</p>
    </div>
  );
}

function DayAct() {
  return (
    <div className="p-4">
      <p className="text-center">daybreak comes...</p>
    </div>
  );
}

function Lobby({ players }: { players: { [key: string]: Player } }) {
  const count = Object.keys(players).length;

  return (
    <div className="p-4">
      <p className="text-center">waiting for players</p>
      <p className="text-center">{count} / 6</p>
    </div>
  );
}
