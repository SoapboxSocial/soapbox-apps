import { useParams } from "../../hooks";
import { PlayerHead } from "./head";
import {
  DaySummary,
  GameAct,
  NightSummary,
  Player,
  PlayerRole,
} from "./shared";

export function ActNight({ act }: { act: GameAct }) {
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

export function ActNightSummary({
  act,
  nightSummary,
}: {
  act: GameAct;
  nightSummary: NightSummary;
}) {
  if (act === GameAct.NIGHT_SUMMARY) {
    if (nightSummary?.healed) {
      return (
        <div className="flex-1 p-4 flex flex-col">
          <p className="text-center">during the night</p>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="block mx-auto w-24">
              <PlayerHead
                disabled
                onClick={null}
                player={nightSummary.healed}
                showName={false}
              />
            </div>

            <p className="text-center">
              {nightSummary.healed.user?.display_name ??
                nightSummary.healed.user.username}{" "}
              was saved
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-4 flex flex-col">
        <p className="text-center">during the night</p>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="block mx-auto w-24">
            <PlayerHead
              disabled
              onClick={null}
              player={nightSummary.killed}
              showName={false}
            />
          </div>

          <p className="text-center">
            {nightSummary.killed.user?.display_name ??
              nightSummary.killed.user.username}{" "}
            was killed
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function ActDaySummary({
  act,
  daySummary,
}: {
  act: GameAct;
  daySummary: DaySummary;
}) {
  if (act === GameAct.DAY_SUMMARY) {
    return (
      <div className="flex-1 p-4 flex flex-col">
        <p className="text-center">the village has spoken</p>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="block mx-auto w-24">
            <PlayerHead
              disabled
              onClick={null}
              player={daySummary.killed}
              showName={false}
            />
          </div>

          <p className="text-center">
            {daySummary.killed.user?.display_name ??
              daySummary.killed.user.username}{" "}
            was executed
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function StartRound({ act, role }: { act: GameAct; role: PlayerRole }) {
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
    );
  }

  return null;
}

export function ActDay({ act }: { act: GameAct }) {
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

export function Lobby({
  act,
  emitStartGame,
  players,
}: {
  act: GameAct;
  emitStartGame: () => void;
  players: Record<string, Player>;
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

export function WinnerStage({ winner }: { winner: "VILLAGER" | "WEREWOLF" }) {
  if (typeof winner === "string") {
    let text: string;

    switch (true) {
      case winner === "VILLAGER":
        text = "the villagers have killed all the werewolves";
        break;
      case winner === "WEREWOLF":
        text = "the werewolves have killed everyone in the town";
        break;
    }

    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <img
          alt=""
          aria-hidden
          className="image-rendering-pixelated w-40 h-40"
          draggable={false}
          loading="eager"
          src="/werewolf/trophy.png"
        />

        <p className="text-center">{text}</p>
      </div>
    );
  }

  return null;
}
