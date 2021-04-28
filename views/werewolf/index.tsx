import { onClose } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_BASE } from "../../constants";
import { useSession, useSoapboxRoomId } from "../../hooks";
import {
  GameAct,
  Player,
  PlayerRole,
  WerewolfEmitEvents,
  WerewolfListenEvents,
} from "./shared";

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
    console.log("Received 'PLAYERS' event", data);
    playersSet(data);
  }, []);

  const [act, actSet] = useState<GameAct>();
  const handleAct = useCallback((data: GameAct) => {
    console.log("Received 'ACT' event", data);
    actSet(data);
  }, []);

  const [player, playerSet] = useState<Player>();
  const handlePlayer = useCallback((data: Player) => {
    console.log("Received 'PLAYER' event", data);
    playerSet(player);
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
    socket.on("PLAYER", handlePlayer);
    socket.on("ACT", handleAct);

    return () => {
      socket.off("PLAYERS", handlePlayers);
      socket.off("PLAYER", handlePlayer);
      socket.off("ACT", handleAct);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Emitters
   */
  const emitKillEvent = useCallback(
    (id: string) => {
      return () => {
        if (typeof id === "undefined") {
          return;
        }

        socket.emit("KILL", id);
      };
    },
    [socket]
  );

  const emitHealEvent = useCallback(
    (id: string) => {
      return () => {
        if (typeof id === "undefined") {
          return;
        }

        socket.emit("HEAL", id);
      };
    },
    [socket]
  );

  const emitScryEvent = useCallback(
    (id: string) => {
      return () => {
        if (typeof id === "undefined") {
          return;
        }

        socket.emit("SCRY", id);
      };
    },
    [socket]
  );

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
      <Stage
        act={act}
        role={player?.role}
        players={players}
        emitKillEvent={emitKillEvent}
        emitHealEvent={emitHealEvent}
        emitScryEvent={emitScryEvent}
      />

      {waitingForPlayers && <Lobby players={players} />}
    </main>
  );
}

function Stage({
  act,
  role,
  players,
  emitKillEvent,
  emitHealEvent,
  emitScryEvent,
}: {
  act?: GameAct;
  role?: PlayerRole;
  players: { [key: string]: Player };
  emitKillEvent: (id: string) => () => void;
  emitHealEvent: (id: string) => () => void;
  emitScryEvent: (id: string) => () => void;
}) {
  if (act === GameAct.NIGHT) {
    return (
      <div className="p-4">
        <p className="text-center">night decends...</p>
      </div>
    );
  }

  if (act === GameAct.WEREWOLF) {
    if (role === PlayerRole.WEREWOLF)
      return (
        <div className="p-4">
          <p className="text-center">you are a werewolf</p>

          <PlayerList players={players} onClick={emitKillEvent} />
        </div>
      );

    return (
      <div className="p-4">
        <p className="text-center">the werewolves are hunting</p>
      </div>
    );
  }

  if (act === GameAct.DOCTOR) {
    if (role === PlayerRole.DOCTOR)
      return (
        <div className="p-4">
          <p className="text-center">you are the doctor</p>

          <PlayerList players={players} onClick={emitHealEvent} />
        </div>
      );

    return (
      <div className="p-4">
        <p className="text-center">the doctor awakens</p>
      </div>
    );
  }

  if (act === GameAct.SEER) {
    if (role === PlayerRole.SEER)
      return (
        <div className="p-4">
          <p className="text-center">you are the seer</p>

          <PlayerList players={players} onClick={emitScryEvent} />
        </div>
      );

    return (
      <div className="p-4">
        <p className="text-center">the seer awakens</p>
      </div>
    );
  }

  if (act === GameAct.DAY) {
    return (
      <div className="p-4">
        <p className="text-center">daybreak comes...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-center">NO ACT SET</p>
    </div>
  );
}

function Lobby({ players }: { players: { [key: string]: Player } }) {
  const count = Object.keys(players).length;

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center">
      <img src="/werewolf/moon.gif" alt="" aria-hidden />

      <p className="text-center">waiting for players</p>

      <p className="text-center">{count} / 6</p>
    </div>
  );
}

function PlayerList({
  players,
  onClick,
}: {
  players: { [key: string]: Player };
  onClick: (id: string) => () => void;
}) {
  return (
    <ul>
      {Object.entries(players).map(([id, player]) => (
        <li key={id}>
          <button onClick={onClick(id)}>{player.user.display_name}</button>
        </li>
      ))}
    </ul>
  );
}
