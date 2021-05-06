import { onClose } from "@soapboxsocial/minis.js";
import cn from "classnames";
import { useCallback, useEffect, useState } from "react";
import {
  useParams,
  useSession,
  useSoapboxRoomId,
  useSocket,
} from "../../hooks";
import {
  GameAct,
  Player,
  PlayerRole,
  PlayerStatus,
  ScryResult,
  WerewolfEmitEvents,
  WerewolfListenEvents,
} from "./shared";

const playersObjToArr = (players: { [key: string]: Player }) =>
  Object.entries(players).map(([id, player]) => ({ id, player }));

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

  const [scryedPlayers, scryedPlayersSet] = useState<ScryResult[]>([]);
  const handleScryedPlayers = useCallback((data: ScryResult) => {
    console.log("Received 'SCRYED_PLAYER' event", data);

    scryedPlayersSet([...scryedPlayers, data]);
  }, []);

  const [markedKills, markedKillsSet] = useState<string[]>([]);
  const handleMarkedKills = useCallback((data: string[]) => {
    console.log("Received 'MARKED_KILLS' event", data);

    markedKillsSet(data);
  }, []);

  const [votedPlayers, votedPlayersSet] = useState<string[]>([]);
  const handleVotedPlayers = useCallback((data: string[]) => {
    console.log("Received 'VOTED_PLAYERS' event", data);

    votedPlayersSet(data);
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
    socket.on("SCRYED_PLAYER", handleScryedPlayers);
    socket.on("MARKED_KILLS", handleMarkedKills);
    socket.on("VOTED_PLAYERS", handleVotedPlayers);

    return () => {
      socket.off("PLAYERS", handlePlayers);
      socket.off("PLAYER", handlePlayer);
      socket.off("ACT", handleAct);
      socket.off("SCRYED_PLAYER", handleScryedPlayers);
      socket.off("MARKED_KILLS", handleMarkedKills);
      socket.off("VOTED_PLAYERS", handleVotedPlayers);

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
      if (typeof id === "undefined") {
        return;
      }

      socket.emit("HEAL", id);
    },
    [socket]
  );

  const emitScryEvent = useCallback(
    (id: string) => {
      if (typeof id === "undefined") {
        return;
      }

      socket.emit("SCRY", id);
    },
    [socket]
  );

  const emitMarkKillEvent = useCallback(
    (id: string) => {
      if (typeof id === "undefined") {
        return;
      }

      socket.emit("MARK_KILL", id);
    },
    [socket]
  );

  const emitVoteEvent = useCallback(
    (id: string) => {
      if (typeof id === "undefined") {
        return;
      }

      socket.emit("VOTE", id);
    },
    [socket]
  );

  const emitStartGame = useCallback(() => {
    socket.emit("START_GAME");
  }, [socket]);

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

  return (
    <main className="flex flex-col min-h-screen select-none relative">
      <Lobby act={act} emitStartGame={emitStartGame} players={players} />

      <StartRound act={act} role={player?.role} />

      <ActNight act={act} />

      <ActWerewolf
        act={act}
        emitKillMarkedEvent={emitKillMarkedEvent}
        emitMarkKillEvent={emitMarkKillEvent}
        markedKills={markedKills}
        players={players}
        role={player?.role}
      />

      <ActDoctor
        act={act}
        emitHealEvent={emitHealEvent}
        players={players}
        role={player?.role}
      />

      <ActSeer
        act={act}
        emitScryEvent={emitScryEvent}
        players={players}
        role={player?.role}
        scryedPlayers={scryedPlayers}
      />

      <ActDay act={act} />

      <ActVoting
        act={act}
        emitVoteEvent={emitVoteEvent}
        players={players}
        votedPlayers={votedPlayers}
      />
    </main>
  );
}

function ActNight({ act }: { act: GameAct }) {
  if (act === GameAct.NIGHT) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          alt=""
          aria-hidden
          className="image-rendering-pixelated w-40 h-40"
          draggable={false}
          loading="eager"
          src="/werewolf/day-to-night.gif"
        />

        <p className="text-center">night descends...</p>
      </div>
    );
  }

  return null;
}

function StartRound({ act, role }: { act: GameAct; role: PlayerRole }) {
  let text = "you are a villager";
  let image = "/werewolf/villager.png";

  switch (true) {
    case role === PlayerRole.DOCTOR:
      text = "you are the doctor";
      image = "/werewolf/doctor.png";
      break;
    case role === PlayerRole.SEER:
      text = "you are the seer";
      image = "/werewolf/seer.png";
      break;
    case role === PlayerRole.WEREWOLF:
      text = "you are a werewolf";
      image = "/werewolf/wolf.png";
      break;
  }

  if (act === GameAct.START_ROUND) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <img
            alt=""
            aria-hidden
            className="image-rendering-pixelated w-40 h-40"
            draggable={false}
            loading="eager"
            src={image}
          />

          <p className="text-center">{text}</p>
        </div>
      </div>
    );
  }

  return null;
}

function ActWerewolf({
  act,
  emitKillMarkedEvent,
  emitMarkKillEvent,
  markedKills,
  players,
  role,
}: {
  act: GameAct;
  emitKillMarkedEvent: () => void;
  emitMarkKillEvent: (id: string) => void;
  markedKills: string[];
  players: { [key: string]: Player };
  role: PlayerRole;
}) {
  const [didMark, didMarkSet] = useState(false);

  useEffect(() => {
    didMarkSet(false);
  }, [act]);

  const handleMark = (id: string) => () => {
    didMarkSet(true);

    emitMarkKillEvent(id);
  };

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
                  disabled={didMark || markedKills.length === 2}
                  isMarked={markedKills.includes(id)}
                  onClick={handleMark(id)}
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
          alt=""
          aria-hidden
          className="image-rendering-pixelated w-40 h-40"
          draggable={false}
          loading="eager"
          src="/werewolf/wolf.png"
        />

        <p className="text-center">the werewolves are hunting</p>
      </div>
    );
  }

  return null;
}

function ActSeer({
  act,
  emitScryEvent,
  players,
  role,
  scryedPlayers,
}: {
  act: GameAct;
  emitScryEvent: (id: string) => void;
  players: { [key: string]: Player };
  role: PlayerRole;
  scryedPlayers: ScryResult[];
}) {
  const [didScry, didScrySet] = useState(false);

  useEffect(() => {
    didScrySet(false);
  }, [act]);

  const handleScry = (id: string) => () => {
    didScrySet(true);

    emitScryEvent(id);
  };

  if (act === GameAct.SEER) {
    if (role === PlayerRole.SEER) {
      return (
        <div className="flex-1 p-4 flex flex-col">
          <p className="text-center">you are the seer</p>

          <p className="text-center">who would you like to ask about?</p>

          <ul className="flex-1 grid grid-cols-4 gap-4 max-w-sm pt-4">
            {playersObjToArr(players).map(({ id, player }) => (
              <li key={id}>
                <PlayerHead
                  isWerewolf={
                    scryedPlayers.find((scryed) => scryed.id === id)?.isWerewolf
                  }
                  disabled={didScry}
                  onClick={handleScry(id)}
                  player={player}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          alt=""
          aria-hidden
          className="image-rendering-pixelated w-40 h-40"
          draggable={false}
          loading="eager"
          src="/werewolf/seer.png"
        />

        <p className="text-center">the seer awakens</p>
      </div>
    );
  }

  return null;
}

function ActDoctor({
  act,
  emitHealEvent,
  players,
  role,
}: {
  act: GameAct;
  emitHealEvent: (id: string) => void;
  players: { [key: string]: Player };
  role: PlayerRole;
}) {
  const [didHeal, didHealSet] = useState(false);

  useEffect(() => {
    didHealSet(false);
  }, [act]);

  const handleHeal = (id: string) => () => {
    didHealSet(true);

    emitHealEvent(id);
  };

  if (act === GameAct.DOCTOR) {
    if (role === PlayerRole.DOCTOR)
      return (
        <div className="flex-1 p-4 flex flex-col">
          <p className="text-center">you are the doctor</p>

          <p className="text-center">choose someone to heal?</p>

          <ul className="flex-1 grid grid-cols-4 gap-4 max-w-sm pt-4">
            {playersObjToArr(players).map(({ id, player }) => (
              <li key={id}>
                <PlayerHead
                  disabled={didHeal}
                  onClick={handleHeal(id)}
                  player={player}
                />
              </li>
            ))}
          </ul>
        </div>
      );

    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          alt=""
          aria-hidden
          className="image-rendering-pixelated"
          draggable={false}
          src="/werewolf/doctor.png"
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
        <img
          alt=""
          aria-hidden
          className="image-rendering-pixelated w-40 h-40"
          draggable={false}
          loading="eager"
          src="/werewolf/night-to-day.gif"
        />

        <p className="text-center">daybreak comes...</p>
      </div>
    );
  }

  return null;
}

function ActVoting({
  act,
  emitVoteEvent,
  players,
  votedPlayers,
}: {
  act: GameAct;
  emitVoteEvent: (id: string) => void;
  players: { [key: string]: Player };
  votedPlayers: string[];
}) {
  const [didVote, didVoteSet] = useState(false);

  useEffect(() => {
    didVoteSet(false);
  }, [act]);

  const handleVote = (id: string) => () => {
    didVoteSet(true);

    emitVoteEvent(id);
  };

  if (act === GameAct.VOTING) {
    return (
      <div className="flex-1 p-4 flex flex-col">
        <p className="text-center">who do you think is a werewolf?</p>

        <ul className="flex-1 grid grid-cols-4 gap-4 max-w-sm pt-4">
          {playersObjToArr(players).map(({ id, player }) => (
            <li key={id}>
              <PlayerHead
                disabled={didVote}
                isVoted={votedPlayers.includes(id)}
                onClick={handleVote(id)}
                player={player}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

function Lobby({
  act,
  emitStartGame,
  players,
}: {
  act: GameAct;
  emitStartGame: () => void;
  players: { [key: string]: Player };
}) {
  const { isAppOpener } = useParams();

  const count = Object.keys(players).length;

  const isWaitingForPlayers = count < 6;

  if (!act) {
    return (
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <img
            alt=""
            aria-hidden
            className="image-rendering-pixelated w-40 h-40"
            draggable={false}
            loading="eager"
            src="/werewolf/moon.gif"
          />

          <p className="text-center">
            {isWaitingForPlayers
              ? "waiting for players"
              : "waiting for game to start"}
          </p>

          <p className="text-center">{count} / 6 (minimum)</p>
        </div>

        {isAppOpener && (
          <button
            onClick={emitStartGame}
            disabled={isWaitingForPlayers}
            className="nes-btn w-full"
          >
            Start Game
          </button>
        )}
      </div>
    );
  }

  return null;
}

function PlayerHead({
  disabled,
  isMarked,
  isVoted,
  isWerewolf,
  onClick,
  player,
}: {
  disabled?: boolean;
  isMarked?: boolean;
  isVoted?: boolean;
  isWerewolf?: boolean;
  onClick: () => void;
  player: Player;
}) {
  const isDead = player.status === PlayerStatus.DEAD;

  return (
    <button
      className="w-full group focus:outline-none"
      onClick={onClick}
      disabled={disabled || isDead}
    >
      <div className="relative w-full h-full aspect-w-1 aspect-h-1">
        <img
          alt=""
          className={cn("mask-image-nes", {
            "filter-grayscale-full": isDead || isMarked,
          })}
          loading="eager"
          src={`https://cdn.soapbox.social/images/${player.user.image}`}
        />

        <div
          className="group-focus opacity-0 group-focus:opacity-100 absolute left-0 top-0 right-0 bottom-0 golden-border pointer-events-none"
          aria-hidden
        />

        {isWerewolf && (
          <div className="absolute">
            <div className="absolute bottom-0 right-1">
              <img
                alt=""
                aria-hidden
                className="w-8 h-8 image-rendering-pixelated"
                loading="eager"
                src="/werewolf/wolf-icon.png"
              />
            </div>
          </div>
        )}

        {isMarked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl text-center text-systemRed-dark">Marked</p>
          </div>
        )}

        {isVoted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl text-center text-systemRed-dark">Voted</p>
          </div>
        )}

        {isDead && (
          <div className="absolute">
            <div className="absolute bottom-0 right-1">
              <img
                alt=""
                aria-hidden
                className="w-8 h-8 image-rendering-pixelated"
                loading="eager"
                src="/werewolf/skull-icon.png"
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-lg text-center truncate">
        {player.user?.display_name ?? player.user.username}
      </p>
    </button>
  );
}
