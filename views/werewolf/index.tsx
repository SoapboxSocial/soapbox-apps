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

  const [markedKills, markedKillsSet] = useState<string[]>([]);
  const handleMarkedKills = useCallback((data: string[]) => {
    console.log("Received 'MARKED_KILLS' event", data);

    markedKillsSet(data);
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
    socket.on("MARKED_KILLS", handleMarkedKills);

    return () => {
      socket.off("PLAYERS", handlePlayers);
      socket.off("PLAYER", handlePlayer);
      socket.off("ACT", handleAct);
      socket.off("SCRY_RESULT", handleScryResult);
      socket.off("MARKED_KILLS", handleMarkedKills);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Emitters
   */
  const emitKillMarkedEvent = useCallback(() => {
    socket.emit("KILL_MARKED");
  }, [socket]);

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

  const emitMarkKillEvent = useCallback(
    (id: string) => {
      return () => {
        if (typeof id === "undefined") {
          return;
        }

        socket.emit("MARK_KILL", id);
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

  if (false)
    return (
      <main className="flex flex-col min-h-screen select-none relative">
        <Lobby players={players} />
      </main>
    );

  return (
    <main className="flex flex-col min-h-screen select-none relative">
      <ActNight act={act} />

      <ActWerewolf
        act={GameAct.WEREWOLF}
        markedKills={markedKills}
        emitKillMarkedEvent={emitKillMarkedEvent}
        emitMarkKillEvent={emitMarkKillEvent}
        players={players}
        role={PlayerRole.WEREWOLF}
      />

      <ActDoctor act={act} role={player?.role} players={players} />

      <ActSeer act={act} role={player?.role} players={players} />

      <ActDay act={act} />

      <ActVoting act={act} players={players} />
    </main>
  );
}

function ActNight({ act }: { act: GameAct }) {
  if (act === GameAct.NIGHT)
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <p className="text-center">night descends...</p>
      </div>
    );

  return null;
}

function ActWerewolf({
  act,
  emitKillMarkedEvent,
  emitMarkKillEvent,
  players,
  role,
  markedKills,
}: {
  act: GameAct;
  emitKillMarkedEvent: () => void;
  emitMarkKillEvent: (id: string) => () => void;
  players: { [key: string]: Player };
  role: PlayerRole;
  markedKills: string[];
}) {
  if (act === GameAct.WEREWOLF) {
    if (role === PlayerRole.WEREWOLF) {
      return (
        <div className="flex-1 p-4 flex flex-col">
          <p className="text-center">you are a werewolf</p>

          <p className="text-center">mark someone to kill</p>

          <ul className="flex-1 grid grid-cols-4 gap-4 max-w-sm pt-4">
            {playersObjToArr(players).map(({ id, player }) => (
              <li key={id}>
                <PlayerHead
                  disabled={markedKills.length === 2}
                  isMarked={markedKills.includes(id)}
                  onClick={emitMarkKillEvent(id)}
                  player={player}
                />
              </li>
            ))}
          </ul>

          <button
            onClick={emitKillMarkedEvent}
            disabled={markedKills.length < 2}
            className="nes-btn w-full"
          >
            Kill Marked
          </button>
        </div>
      );
    }

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

  return null;
}

function ActSeer({
  act,
  role,
  players,
}: {
  act: GameAct;
  role: PlayerRole;
  players: { [key: string]: Player };
}) {
  const playerRoleSeer = role === PlayerRole.SEER;

  if (act === GameAct.SEER) {
    if (playerRoleSeer) {
      return (
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="text-center">you are the seer</p>

          <p className="text-center">who would you like to ask about?</p>

          <ul className="flex-1 grid grid-cols-4 gap-4 max-w-lg">
            {playersObjToArr(players).map(({ id, player }) => (
              <li key={id}>
                <PlayerHead onClick={null} player={player} />
              </li>
            ))}
          </ul>
        </div>
      );
    }

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

  return null;
}

function ActDoctor({
  act,
  role,
  players,
}: {
  act: GameAct;
  role: PlayerRole;
  players: { [key: string]: Player };
}) {
  if (act === GameAct.DOCTOR) {
    if (role === PlayerRole.DOCTOR)
      return (
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <p className="text-center">you are the doctor</p>

          <p className="text-center">who would you like to heal?</p>

          <ul className="flex-1 grid grid-cols-4 gap-4 max-w-lg">
            {playersObjToArr(players).map(({ id, player }) => (
              <li key={id}>
                <PlayerHead onClick={null} player={player} />
              </li>
            ))}
          </ul>
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

  return null;
}

function ActDay({ act }: { act: GameAct }) {
  if (act === GameAct.DAY) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <p className="text-center">daybreak comes...</p>
      </div>
    );
  }

  return null;
}

function ActVoting({
  act,
  players,
}: {
  act: GameAct;
  players: { [key: string]: Player };
}) {
  if (act === GameAct.VOTING) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <p className="text-center">who do you think is a werewolf?</p>

        <PlayerList players={players} onClick={null} />
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

function PlayerHead({
  isWerewolf,
  isMarked,
  onClick,
  player,
  disabled,
}: {
  disabled?: boolean;
  isMarked?: boolean;
  isWerewolf?: boolean;
  onClick: () => void;
  player: Player;
}) {
  const isDead = player.status === PlayerStatus.DEAD;

  return (
    <button className="w-full" onClick={onClick} disabled={disabled || isDead}>
      <div className="relative w-full h-full aspect-w-1 aspect-h-1">
        <img
          className={cn("mask-image-nes", {
            "filter-grayscale-full": isDead || isMarked,
          })}
          src={`https://cdn.soapbox.social/images/${player.user.image}`}
          alt=""
        />

        {/* <div
          className="absolute left-0 top-0 right-0 bottom-0 golden-border pointer-events-none"
          aria-hidden
        /> */}

        {isWerewolf && (
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

        {isMarked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl text-center text-systemRed-dark">Marked</p>
          </div>
        )}

        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl text-center text-systemRed-dark">Dead</p>
          </div>
        )}
      </div>

      <p className="text-lg text-center truncate">
        {player.user?.display_name ?? player.user.username}
      </p>
    </button>
  );
}

const playersObjToArr = (players: { [key: string]: Player }) =>
  Object.entries(players).map(([id, player]) => ({ id, player }));

function PlayerList({
  players,
  onClick,
  scryResult,
  role,
}: {
  role?: PlayerRole;
  scryResult?: ScryResult;
  suggestKillResult?: string[];
  players: { [key: string]: Player };
  onClick: (id: string) => () => void;
}) {
  return (
    <div className="flex-1 w-full pt-4">
      <ul className="grid grid-cols-4 gap-4 max-w-lg">
        {Object.entries(players).map(([id, player]) => {
          const isDead = player.status === PlayerStatus.DEAD;
          const isWerewolf = scryResult?.id === id;

          return <li key={id} className="min-w-0"></li>;
        })}
      </ul>

      <button className="nes-btn w-full">Kill</button>
    </div>
  );
}
