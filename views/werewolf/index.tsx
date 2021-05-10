import { onClose } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession, useSoapboxRoomId, useSocket } from "../../hooks";
import {
  ActDay,
  ActDaySummary,
  ActNight,
  ActNightSummary,
  Lobby,
  StartRound,
  WinnerStage,
} from "./presenters";
import { ActDoctor, ActSeer, ActVoting, ActWerewolf } from "./roles";
import {
  DaySummary,
  GameAct,
  NightSummary,
  Player,
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

  const [players, playersSet] = useState<Record<string, Player>>({});
  const handlePlayers = useCallback((data: Record<string, Player>) => {
    console.log("Received 'PLAYERS' event", data);

    playersSet(data);
  }, []);

  const [act, actSet] = useState<GameAct>();
  const handleAct = useCallback((data: GameAct) => {
    console.log("Received 'ACT' event", data);

    actSet(data);
  }, []);

  const player = useMemo(() => {
    if (!socket) {
      return;
    }

    return players[socket.id];
  }, [players, socket]);

  const [scryedPlayers, scryedPlayersSet] = useState<ScryResult[]>([]);
  const handleScryedPlayers = useCallback((data: ScryResult) => {
    console.log("Received 'SCRYED_PLAYER' event", data);

    scryedPlayersSet((prev) => [...prev, data]);
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

  const [nightSummary, nightSummarySet] = useState<NightSummary>();
  const handleNightSummary = useCallback((data: NightSummary) => {
    console.log("Received 'NIGHT_SUMMARY' event", data);

    nightSummarySet(data);
  }, []);

  const [daySummary, daySummarySet] = useState<DaySummary>();
  const handleDaySummary = useCallback((data: DaySummary) => {
    console.log("Received 'DAY_SUMMARY' event", data);

    daySummarySet(data);
  }, []);

  const [winner, winnerSet] = useState<"VILLAGER" | "WEREWOLF">();
  const handleWinner = useCallback((data: "VILLAGER" | "WEREWOLF") => {
    console.log("Received 'WINNER' event", data);

    winnerSet(data);
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
    socket.on("ACT", handleAct);
    socket.on("SCRYED_PLAYER", handleScryedPlayers);
    socket.on("MARKED_KILLS", handleMarkedKills);
    socket.on("VOTED_PLAYERS", handleVotedPlayers);
    socket.on("NIGHT_SUMMARY", handleNightSummary);
    socket.on("DAY_SUMMARY", handleDaySummary);
    socket.on("WINNER", handleWinner);

    return () => {
      socket.off("PLAYERS", handlePlayers);
      socket.off("ACT", handleAct);
      socket.off("SCRYED_PLAYER", handleScryedPlayers);
      socket.off("MARKED_KILLS", handleMarkedKills);
      socket.off("VOTED_PLAYERS", handleVotedPlayers);
      socket.off("NIGHT_SUMMARY", handleNightSummary);
      socket.off("DAY_SUMMARY", handleDaySummary);
      socket.off("WINNER", handleWinner);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Emitters
   */

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

  const emitEndTurn = useCallback(
    (role: GameAct) => {
      return () => {
        socket.emit("END_TURN", role);
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

  return (
    <main className="flex flex-col min-h-screen select-none relative">
      <Lobby act={act} emitStartGame={emitStartGame} players={players} />

      <StartRound act={act} role={player?.role} />

      <ActNight act={act} />

      <ActWerewolf
        act={act}
        emitMarkKillEvent={emitMarkKillEvent}
        markedKills={markedKills}
        players={players}
        role={player?.role}
        status={player?.status}
      />

      <ActDoctor
        act={act}
        emitHealEvent={emitHealEvent}
        endTurn={emitEndTurn(GameAct.DOCTOR)}
        players={players}
        role={player?.role}
        status={player?.status}
      />

      <ActSeer
        act={act}
        emitScryEvent={emitScryEvent}
        endTurn={emitEndTurn(GameAct.SEER)}
        players={players}
        role={player?.role}
        scryedPlayers={scryedPlayers}
        status={player?.status}
      />

      <ActNightSummary act={act} nightSummary={nightSummary} />

      <ActDay act={act} />

      <ActDaySummary act={act} daySummary={daySummary} />

      <ActVoting
        act={act}
        emitVoteEvent={emitVoteEvent}
        players={players}
        role={player?.role}
        scryedPlayers={scryedPlayers}
        socket={socket}
        status={player?.status}
        votedPlayers={votedPlayers}
      />

      <WinnerStage winner={winner} />
    </main>
  );
}
