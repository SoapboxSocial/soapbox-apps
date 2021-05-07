import { User } from "@soapboxsocial/minis.js";

export enum PlayerStatus {
  ALIVE = "ALIVE",
  DEAD = "DEAD",
  SAVED = "SAVED",
}

export enum PlayerRole {
  WEREWOLF = "WEREWOLF",
  SEER = "SEER",
  DOCTOR = "DOCTOR",
  VILLAGER = "VILLAGER",
}

export enum GameAct {
  DAY = "DAY",
  DAY_SUMMARY = "DAY_SUMMARY",
  DOCTOR = "DOCTOR",
  NIGHT = "NIGHT",
  NIGHT_SUMMARY = "NIGHT_SUMMARY",
  SEER = "SEER",
  START_ROUND = "START_ROUND",
  VILLAGER = "VILLAGER",
  VOTING = "VOTING",
  WEREWOLF = "WEREWOLF",
}

export type Player = {
  role: PlayerRole;
  status: PlayerStatus;
  user: User;
};

export type ScryResult = {
  id: string;
  isWerewolf: boolean;
};

export type NightSummary = {
  healed?: Player;
  killed?: Player;
};

export type DaySummary = { killed: Player };

export interface WerewolfListenEvents {
  TIME: (timeLeft: number) => void;
  PLAYERS: (players: Record<string, Player>) => void;
  PLAYER: (player: Player) => void;
  ACT: (act: GameAct) => void;
  SCRY_RESULT: ({ id, isWerewolf }: ScryResult) => void;
  SUGGEST_KILL_RESULT: (id: string) => void;
  MARKED_KILLS: (marked: string[]) => void;
  SCRYED_PLAYER: (scryed: ScryResult) => void;
  VOTED_PLAYERS: (voted: string[]) => void;
  NIGHT_SUMMARY: (summary: NightSummary) => void;
  DAY_SUMMARY: (summary: DaySummary) => void;
}

export interface WerewolfEmitEvents {
  CLOSE_GAME: () => void;
  JOIN_GAME: (user: User) => void;
  START_GAME: () => void;
  MARK_KILL: (id: string) => void;
  HEAL: (id: string) => void;
  SCRY: (id: string) => void;
  VOTE: (id: string) => void;
}
