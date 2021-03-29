export type Question = {
  category: string;
  correct_answer: string;
  difficulty: "easy" | "medium" | "hard";
  incorrect_answers: string[];
  question: string;
  type: "boolean" | "multiple";
};

export type Vote = {
  answer: string;
  user: User;
};

export type DifficultyOptions = "any" | "easy" | "medium" | "hard";
