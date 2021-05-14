import { onClose, User } from "@soapboxsocial/minis.js";
import cn from "classnames";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import shuffle from "lodash.shuffle";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWindowSize } from "react-use";
import { io, Socket } from "socket.io-client";
import Button from "../../components/inputs/button";
import Select from "../../components/inputs/select";
import { SERVER_BASE } from "../../constants";
import {
  useParams,
  useSession,
  useSoapboxRoomId,
  useTriviaCategories,
} from "../../hooks";
import LoadingView from "../loading";
import type { DifficultyOptions, Question, Score, Vote } from "./types";

interface TriviaEmitEvents {
  START_ROUND: (category: string, difficulty: DifficultyOptions) => void;
  CLOSE_GAME: () => void;
  JOIN_GAME: (user: User) => void;
  VOTE: (vote: Vote) => void;
}

interface TriviaListenEvents {
  VOTES: (votes: Vote[]) => void;
  QUESTION: (question: Question | null) => void;
  REVEAL: () => void;
  SCORES: (scores: Score[]) => void;
}

export function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<TriviaListenEvents, TriviaEmitEvents>>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(`${SERVER_BASE}/trivia`, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function TriviaView() {
  const user = useSession();

  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();

  const socket = useSocket();

  const categories = useTriviaCategories();

  /**
   * 'question' Event Handling
   */
  const [activeQuestion, activeQuestionSet] = useState<Question>();
  const handleQuestion = useCallback((data: Question) => {
    console.log("Received 'question' event with payload", data);

    activeQuestionSet(data);
  }, []);

  const answers = useMemo(() => {
    if (activeQuestion)
      return shuffle([
        activeQuestion.correct_answer,
        ...activeQuestion.incorrect_answers,
      ]);

    return null;
  }, [activeQuestion]);

  /**
   * 'vote' Event Handling
   */
  const [votes, votesSet] = useState<Vote[]>([]);
  const handleVotes = useCallback((data: Vote[]) => {
    console.log("Received 'vote' event with payload", data);

    votesSet(data);
  }, []);

  /**
   * 'reveal' Event Handling
   */
  const [showAnswer, showAnswerSet] = useState(false);
  const handleReveal = useCallback(() => {
    console.log("Received 'reveal' event");

    showAnswerSet(true);
  }, []);

  useEffect(() => {
    showAnswerSet(false);
  }, [activeQuestion]);

  /**
   * 'scores' Event Handling
   */
  const [scores, scoresSet] = useState<Score[]>();
  const handleScores = useCallback((data: Score[]) => {
    console.log("Received 'scores' event with payload", data);

    scoresSet(data);
  }, []);

  /**
   * Voting Logic
   */
  const [votedAnswer, votedAnswerSet] = useState<string>(null);

  useEffect(() => {
    if (typeof votedAnswer === "string") votedAnswerSet(null);
  }, [activeQuestion]);

  const emitVote = useCallback(
    (answer: string) => {
      return () => {
        votedAnswerSet(answer);

        socket.emit("VOTE", { answer, user });
      };
    },
    [socket]
  );

  const [category, categorySet] = useState<string>("all");
  const handleCategorySelect = (event: ChangeEvent<HTMLSelectElement>) =>
    categorySet(event.target.value);

  const [difficulty, difficultySet] = useState<DifficultyOptions>("any");
  const handleDifficultySelect = (event: ChangeEvent<HTMLSelectElement>) =>
    difficultySet(event.target.value as DifficultyOptions);

  const emitStartRound = useCallback(() => {
    socket.emit("START_ROUND", category, difficulty);
  }, [socket, category, difficulty]);

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", user);

    socket.on("QUESTION", handleQuestion);
    socket.on("REVEAL", handleReveal);
    socket.on("SCORES", handleScores);
    socket.on("VOTES", handleVotes);

    return () => {
      socket.off("QUESTION", handleQuestion);
      socket.off("REVEAL", handleReveal);
      socket.off("SCORES", handleScores);
      socket.off("VOTES", handleVotes);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Derived Values
   */

  const calcVoteCount = (answer: string) =>
    votes.filter((vote) => vote.answer === answer).length;

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

  if (!activeQuestion && isAppOpener && categories) {
    if (scores)
      return (
        <main className="flex flex-col min-h-screen select-none relative">
          <div className="pt-4 px-4">
            <h1 className="text-title2 font-bold text-center">Scoreboard</h1>
          </div>

          <div className="flex-1 px-4 pt-4">
            <ul className="text-xl space-y-4">
              <li className="flex font-bold">
                <div className="w-20">Rank</div>
                <div className="flex-1">Player</div>
                <div className="flex-1 text-center">Score</div>
              </li>

              {scores.map((el, i) => (
                <li key={el.display_name} className="flex">
                  <div className="w-20">{`#${i + 1}`}</div>
                  <div className="flex-1 min-w-0">
                    <span className="truncate">{el.display_name}</span>
                  </div>
                  <div className="flex-1 text-center">{el.score}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4">
            <Button onClick={() => scoresSet(null)}>New round</Button>
          </div>
        </main>
      );

    return (
      <main className="flex flex-col min-h-screen select-none">
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <div>
              <label className="flex mb-2" htmlFor="category">
                <span className="text-body">Choose a category</span>
              </label>

              <Select
                id="category"
                onChange={handleCategorySelect}
                value={category}
                options={[{ label: "All", value: "all" }, ...categories]}
              />
            </div>

            <div>
              <label className="flex mb-2" htmlFor="category">
                <span className="text-body">Select difficulty</span>
              </label>

              <Select
                id="difficulty"
                onChange={handleDifficultySelect}
                value={difficulty}
                options={[
                  { label: "Any", value: "any" },
                  { label: "Easy", value: "easy" },
                  { label: "Medium", value: "medium" },
                  { label: "Hard", value: "hard" },
                ]}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={emitStartRound}>Start a round</Button>
          </div>
        </div>
      </main>
    );
  }

  if (activeQuestion)
    return (
      <main className="flex flex-col min-h-screen select-none relative">
        <Timer key={activeQuestion.question} />

        <div className="flex-1 px-4 flex items-center justify-center">
          <p
            className="text-body font-bold text-center break-words"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(activeQuestion.question),
            }}
          />
        </div>

        <div className="px-4 pb-4 space-y-2">
          {answers.map((answer) => (
            <TriviaButton
              active={votedAnswer === answer}
              correct={answer === activeQuestion.correct_answer}
              disabled={showAnswer || votedAnswer}
              key={answer}
              onClick={emitVote(answer)}
              reveal={showAnswer}
              voteCount={calcVoteCount(answer)}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(answer),
                }}
              />
            </TriviaButton>
          ))}
        </div>
      </main>
    );

  if (scores)
    return (
      <main className="flex flex-col min-h-screen select-none relative">
        <div className="pt-4 px-4">
          <h1 className="text-title2 font-bold text-center">Scoreboard</h1>
        </div>

        <div className="flex-1 p-4">
          <ul className="text-xl space-y-4">
            <li className="flex font-bold">
              <div className="w-20">Rank</div>
              <div className="flex-1">Player</div>
              <div className="flex-1 text-center">Score</div>
            </li>

            {scores.map((el, i) => (
              <li key={el.display_name} className="flex">
                <div className="w-20">{`#${i + 1}`}</div>
                <div className="flex-1 min-w-0">
                  <span className="truncate">{el.display_name}</span>
                </div>
                <div className="flex-1 text-center">{el.score}</div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );

  return <LoadingView />;
}

function Timer() {
  const { width: screenMaxWidth } = useWindowSize();

  return (
    <div className="absolute top-0 right-0 left-0">
      <motion.div
        animate={{ width: screenMaxWidth }}
        transition={{ from: 0, type: "tween", ease: "linear", duration: 10 }}
        className="h-1 bg-soapbox"
      />
    </div>
  );
}

function TriviaButton({
  active,
  children,
  correct,
  disabled,
  onClick,
  reveal,
  voteCount,
}) {
  const cachedClassNames = cn(
    "w-full rounded py-3 px-6 text-sm font-semibold focus:outline-none focus:ring-4 border-2 relative",
    active
      ? "text-white border-soapbox bg-soapbox"
      : "border-systemGrey4-light",
    {
      "text-white border-systemGreen-light bg-systemGreen-light":
        reveal & correct,
      "text-white border-systemRed-light bg-systemRed-light":
        active && reveal && !correct,
    }
  );

  return (
    <button onClick={onClick} className={cachedClassNames} disabled={disabled}>
      {children}

      {reveal && disabled && (
        <span className="absolute transform-gpu right-4 top-1/2 -translate-y-1/2 text-sm">
          {voteCount}
        </span>
      )}
    </button>
  );
}
