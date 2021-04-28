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

export type Player = {
  role: PlayerRole;
  status: PlayerStatus;
  user: User;
};

export interface WerewolfListenEvents {
  TIME: (timeLeft: number) => void;
  PLAYERS: (players: { [key: string]: Player }) => void;
  ACT: (act: "NIGHT" | "DAY") => void;
  WAKE: (role: "WEREWOLF" | "DOCTOR" | "SEER") => void;
  SLEEP: (role: "WEREWOLF" | "DOCTOR" | "SEER") => void;
}

export interface WerewolfEmitEvents {
  CLOSE_GAME: () => void;
  JOIN_GAME: ({ user }: { user: User }) => void;
}
