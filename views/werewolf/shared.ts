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
  WEREWOLF = "WEREWOLF",
  SEER = "SEER",
  DOCTOR = "DOCTOR",
  VILLAGER = "VILLAGER",
  NIGHT = "NIGHT",
}

export type Player = {
  role: PlayerRole;
  status: PlayerStatus;
  user: User;
};

export interface WerewolfListenEvents {
  TIME: (timeLeft: number) => void;
  PLAYERS: (players: { [key: string]: Player }) => void;
  PLAYER: (player: Player) => void;
  ACT: (act: GameAct) => void;
}

export interface WerewolfEmitEvents {
  CLOSE_GAME: () => void;
  JOIN_GAME: ({ user }: { user: User }) => void;
  KILL: (id: string) => void;
  HEAL: (id: string) => void;
  SCRY: (id: string) => void;
}
