import { onClose } from "@soapboxsocial/minis.js";
import cn from "classnames";
import { useCallback, useEffect, useState } from "react";
import { useSession, useSoapboxRoomId, useSocket } from "../../hooks";
import {
  GameAct,
  Player,
  PlayerRole,
  PlayerStatus,
  ScryResult,
  WerewolfEmitEvents,
  WerewolfListenEvents,
} from "./shared";

export default function WerewolfView() {
  const user = useSession();

  const soapboxRoomId = useSoapboxRoomId();

  const socket = useSocket<WerewolfListenEvents, WerewolfEmitEvents>(
    "werewolf"
  );

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
    playerSet(data);
  }, []);

  const [scryResult, scryResultSet] = useState<ScryResult>();
  const handleScryResult = useCallback((data: ScryResult) => {
    console.log("Received 'SCRY_RESULT' event", data);
    scryResultSet(data);
  }, []);

  /**
   * Setup Listeners
   */
  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", user);

    socket.on("PLAYERS", handlePlayers);
    socket.on("PLAYER", handlePlayer);
    socket.on("ACT", handleAct);
    socket.on("SCRY_RESULT", handleScryResult);

    return () => {
      socket.off("PLAYERS", handlePlayers);
      socket.off("PLAYER", handlePlayer);
      socket.off("ACT", handleAct);
      socket.off("SCRY_RESULT", handleScryResult);

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

  const emitVoteEvent = useCallback(
    (id: string) => {
      return () => {
        if (typeof id === "undefined") {
          return;
        }
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
      {!waitingForPlayers && (
        <Stage
          act={act}
          role={player?.role}
          scryResult={scryResult}
          players={players}
          emitKillEvent={emitKillEvent}
          emitHealEvent={emitHealEvent}
          emitScryEvent={emitScryEvent}
        />
      )}

      {waitingForPlayers && <Lobby players={players} />}
    </main>
  );
}

function Stage({
  act,
  role,
  players,
  scryResult,
  emitKillEvent,
  emitHealEvent,
  emitScryEvent,
}: {
  act?: GameAct;
  role?: PlayerRole;
  scryResult?: ScryResult;
  players: { [key: string]: Player };
  emitKillEvent: (id: string) => () => void;
  emitHealEvent: (id: string) => () => void;
  emitScryEvent: (id: string) => () => void;
}) {
  if (act === GameAct.NIGHT) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <p className="text-center">night descends...</p>
      </div>
    );
  }

  if (act === GameAct.WEREWOLF) {
    if (role === PlayerRole.WEREWOLF)
      return (
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="text-center">you are a werewolf</p>

          <p className="text-center">who would you like to kill?</p>

          <PlayerList players={players} onClick={emitKillEvent} />
        </div>
      );

    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          className="image-rendering-pixelated"
          src="/werewolf/wolf.png"
          alt=""
          aria-hidden
        />

        <p className="text-center">the werewolves are hunting</p>
      </div>
    );
  }

  if (act === GameAct.DOCTOR) {
    if (role === PlayerRole.DOCTOR)
      return (
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="text-center">you are the doctor</p>

          <p className="text-center">who would you like to heal?</p>

          <PlayerList players={players} onClick={emitHealEvent} />
        </div>
      );

    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          className="image-rendering-pixelated"
          src="/werewolf/doctor.png"
          alt=""
          aria-hidden
        />

        <p className="text-center">the doctor awakens</p>
      </div>
    );
  }

  if (act === GameAct.SEER) {
    if (role === PlayerRole.SEER)
      return (
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="text-center">you are the seer</p>

          <p className="text-center">who would you like to ask about?</p>

          <PlayerList
            scryResult={scryResult}
            players={players}
            onClick={emitScryEvent}
          />
        </div>
      );

    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          className="image-rendering-pixelated"
          src="/werewolf/seer.png"
          alt=""
          aria-hidden
        />

        <p className="text-center">the seer awakens</p>
      </div>
    );
  }

  if (act === GameAct.DAY) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <p className="text-center">daybreak comes...</p>
      </div>
    );
  }

  if (act === GameAct.VOTING) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <p className="text-center">who do you think is a werewolf?</p>

        <PlayerList players={players} onClick={emitScryEvent} />
      </div>
    );
  }

  return null;
}

function Lobby({ players }: { players: { [key: string]: Player } }) {
  const count = Object.keys(players).length;

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center">
      <img
        className="image-rendering-pixelated"
        src="/werewolf/moon.gif"
        alt=""
        aria-hidden
      />

      <p className="text-center">waiting for players</p>

      <p className="text-center">{count} / 6 (minimum)</p>
    </div>
  );
}

function PlayerList({
  players,
  onClick,
  scryResult,
  role,
}: {
  role?: PlayerRole;
  scryResult?: ScryResult;
  players: { [key: string]: Player };
  onClick: (id: string) => () => void;
}) {
  return (
    <ul className="flex-1 w-full grid grid-cols-4 gap-4 pt-4">
      {Object.entries(players).map(([id, player]) => {
        const playerRoleSeer = role === PlayerRole.SEER;

        const isDead = player.status === PlayerStatus.DEAD;
        const isWerewolf = scryResult?.id === id;

        return (
          <li key={id} className="min-w-0">
            <button className="w-full" onClick={onClick(id)} disabled={isDead}>
              <div className="relative w-full h-full aspect-w-1 aspect-h-1">
                <img
                  className={cn("mask-image-nes", {
                    "filter-grayscale": isDead,
                  })}
                  src={`https://cdn.soapbox.social/images/${player.user.image}`}
                  alt=""
                />

                <div
                  className="absolute left-0 top-0 right-0 bottom-0 golden-border pointer-events-none"
                  aria-hidden
                />

                {playerRoleSeer && isWerewolf && (
                  <div className="absolute bottom-2 right-2">
                    <img
                      loading="lazy"
                      className="w-8 h-8 image-rendering-pixelated"
                      src="/werewolf/wolf.png"
                      alt=""
                      aria-hidden
                    />
                  </div>
                )}

                {isDead && (
                  <div className="absolute top-1/2 transform-gpu -translate-y-1/2 w-full">
                    <p className="text-xl text-center text-systemRed-dark">
                      Dead
                    </p>
                  </div>
                )}
              </div>

              <p className="text-lg text-center truncate">
                {player.user?.display_name ?? player.user.username}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
