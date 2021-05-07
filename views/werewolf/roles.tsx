import { useEffect, useState } from "react";
import { PlayerHead } from "./head";
import { GameAct, Player, PlayerRole, PlayerStatus } from "./shared";

const playersObjToArr = (players: Record<string, Player>) =>
  Object.entries(players).map(([id, player]) => ({ id, player }));

export function ActWerewolf({
  act,
  emitMarkKillEvent,
  markedKills,
  players,
  role,
  status,
}: {
  act: GameAct;
  emitMarkKillEvent: (id: string) => void;
  markedKills: string[];
  players: Record<string, Player>;
  role: PlayerRole;
  status: PlayerStatus;
}) {
  const [didMark, didMarkSet] = useState(false);

  let werewolfCount = 2;
  switch (true) {
    case Object.keys(players).length > 8:
      werewolfCount = 3;
      break;
    case Object.keys(players).length > 12:
      werewolfCount = 4;
      break;
  }

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
                  isWerewolf={player.role === PlayerRole.WEREWOLF}
                  disabled={
                    player.role === PlayerRole.WEREWOLF ||
                    didMark ||
                    markedKills.length === werewolfCount
                  }
                  isMarked={markedKills.includes(id)}
                  onClick={handleMark(id)}
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
          src="/werewolf/wolf.png"
        />

        <p className="text-center">the werewolves are hunting</p>
      </div>
    );
  }

  return null;
}

export function ActSeer({
  act,
  emitScryEvent,
  players,
  role,
  scryedPlayers,
  status,
}: {
  act: GameAct;
  emitScryEvent: (id: string) => void;
  players: Record<string, Player>;
  role: PlayerRole;
  scryedPlayers: ScryResult[];
  status: PlayerStatus;
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
                  disabled={didScry || player.role === PlayerRole.SEER}
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

export function ActDoctor({
  act,
  emitHealEvent,
  players,
  role,
  status,
}: {
  act: GameAct;
  emitHealEvent: (id: string) => void;
  players: Record<string, Player>;
  role: PlayerRole;
  status: PlayerStatus;
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

export function ActVoting({
  act,
  emitVoteEvent,
  players,
  votedPlayers,
  role,
  status,
  scryedPlayers,
  socket,
}: {
  act: GameAct;
  emitVoteEvent: (id: string) => void;
  players: Record<string, Player>;
  votedPlayers: string[];
  role: PlayerRole;
  status: PlayerStatus;
  scryedPlayers: ScryResult[];
  socket: Socket<WerewolfListenEvents, WerewolfEmitEvents>;
}) {
  const isSeer = role === PlayerRole.SEER;

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
      <Fragment>
        <Timer socket={socket} />

        <div className="flex-1 p-4 flex flex-col">
          <p className="text-center">who do you think is a werewolf?</p>

          <ul className="flex-1 grid grid-cols-4 gap-4 max-w-sm pt-4">
            {playersObjToArr(players).map(({ id, player }) => (
              <li key={id}>
                <PlayerHead
                  isWerewolf={
                    isSeer &&
                    scryedPlayers?.find((scryed) => scryed.id === id)
                      ?.isWerewolf
                  }
                  disabled={didVote}
                  votes={votedPlayers.filter((player) => player === id)}
                  onClick={handleVote(id)}
                  player={player}
                />
              </li>
            ))}
          </ul>
        </div>
      </Fragment>
    );
  }

  return null;
}
