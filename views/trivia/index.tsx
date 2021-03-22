import { useChannel, useEvent } from "@harelpls/use-pusher";
import { onClose } from "@soapboxsocial/minis.js";
import cn from "classnames";
import DOMPurify from "dompurify";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import Button from "../../components/inputs/button";
import Select from "../../components/inputs/select";
import { useParams, useSoapboxRoomId, useTriviaCategories } from "../../hooks";
import LoadingView from "../loading";

type Question = {
  category: string;
  type: "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: "True" | "False";
  incorrect_answers: ["True" | "False"];
};

const TRIVIA_SERVER_BASE_URL = "http://localhost:8080";

export default function TriviaView() {
  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();

  const channelName = `mini-trivia-${soapboxRoomId}`;
  const channel = useChannel(channelName);

  const categories = useTriviaCategories();

  const [category, categorySet] = useState<string>("all");

  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) =>
    categorySet(event.target.value);

  const [activeQuestion, activeQuestionSet] = useState<Question>();

  useEvent(channel, "question", (data: { question: Question }) =>
    activeQuestionSet(data.question)
  );

  const init = useCallback(async () => {
    console.log("[init]");

    try {
      await fetch(
        `${TRIVIA_SERVER_BASE_URL}/trivia/${soapboxRoomId}/setup?category=${category}`
      );
    } catch (error) {
      console.error(error);
    }
  }, [category, soapboxRoomId]);

  const [votedAnswer, votedAnswerSet] = useState<string>(null);

  useEffect(() => {
    if (typeof votedAnswer === "string") votedAnswerSet(null);
  }, [activeQuestion]);

  const [votes, votesSet] = useState<string[]>([]);

  useEvent(channel, "vote", (data: { votes: string[] }) =>
    votesSet(data.votes)
  );

  const voteOnQuestion = (answer: string) => async () => {
    votedAnswerSet(answer);

    await fetch(`${TRIVIA_SERVER_BASE_URL}/trivia/${soapboxRoomId}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote: answer }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const calcVoteCount = (answer: string) =>
    votes.filter((vote) => vote === answer).length;

  /**
   * Mini Cleanup
   */

  const [isMiniClosed, isMiniClosedSet] = useState(false);

  const handleOnClose = useCallback(async () => {
    console.log("[onClose]");

    await fetch(`${TRIVIA_SERVER_BASE_URL}/trivia/${soapboxRoomId}/reset`);

    isMiniClosedSet(true);
  }, [soapboxRoomId]);

  onClose(handleOnClose);

  if (!activeQuestion && isAppOpener && categories) {
    return (
      <main className="flex flex-col min-h-screen select-none">
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            <label className="flex mb-2" htmlFor="category">
              <span className="text-body">Category</span>
            </label>

            <Select
              id="category"
              onChange={handleSelect}
              value={category}
              options={[{ label: "All", value: "all" }, ...categories]}
            />
          </div>

          <div className="pt-4">
            <Button onClick={init}>Start Trivia</Button>
          </div>
        </div>
      </main>
    );
  }

  if (activeQuestion)
    return (
      <main className="flex flex-col min-h-screen select-none">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">Trivia</h1>

            <Timer />
          </div>
        </div>

        <div className="flex-1 p-4 flex items-center justify-center">
          <p
            className="text-body font-bold text-center break-words"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(activeQuestion.question),
            }}
          />
        </div>

        <div className="p-4 space-y-2">
          <TriviaButton
            active={votedAnswer === "True"}
            correct={
              votedAnswer === "True" &&
              votedAnswer === activeQuestion.correct_answer
            }
            disabled={votedAnswer}
            onClick={voteOnQuestion("True")}
            text="True"
            voteCount={calcVoteCount("True")}
          />

          <TriviaButton
            active={votedAnswer === "False"}
            correct={
              votedAnswer === "False" &&
              votedAnswer === activeQuestion.correct_answer
            }
            disabled={votedAnswer}
            onClick={voteOnQuestion("False")}
            text="False"
            voteCount={calcVoteCount("False")}
          />
        </div>
      </main>
    );

  return <LoadingView restartCallback={isMiniClosed ? init : null} />;
}

function Timer() {
  const soapboxRoomId = useSoapboxRoomId();

  const channelName = `mini-trivia-${soapboxRoomId}`;

  const channel = useChannel(channelName);

  const [timer, timerSet] = useState(0);

  useEvent(channel, "timer", (data: { timer: number }) => {
    console.log("Received 'timer' event");

    timerSet(data.timer);
  });

  const duration = 30;

  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (timer / duration) * circumference;

  return (
    <svg
      className="absolute right-0 top-1/2 transform-gpu -translate-y-1/2 h-8 w-8 rounded-full"
      width={32}
      height={32}
    >
      <defs>
        <linearGradient id="progress-ring__gradient">
          <stop offset="0%" stopColor="#4d3bff" />
          <stop offset="100%" stopColor="#a161ff" />
        </linearGradient>
      </defs>

      <circle
        className="progress-ring__circle"
        cx={16}
        cy={16}
        r={radius}
        stroke="url(#progress-ring__gradient)"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeWidth={8}
      />

      <style jsx>{`
        .progress-ring__circle {
          transform-origin: center;
          transform: rotate(-90deg);
          transition: stroke-dashoffset 0.5s;
        }
      `}</style>
    </svg>
  );
}

function TriviaButton({ active, correct, disabled, onClick, text, voteCount }) {
  const cachedClassNames = cn(
    "w-full rounded py-3 px-4 text-body font-semibold focus:outline-none focus:ring-4 border-2",
    disabled ? "flex justify-between" : "",
    active
      ? correct
        ? "bg-accent-green border-accent-green text-black"
        : "bg-soapbox border-soapbox text-white"
      : "border-systemGrey4-light dark:border-systemGrey4-dark"
  );

  return (
    <button onClick={onClick} className={cachedClassNames} disabled={disabled}>
      <span>{text}</span>

      {disabled && <span className="text-sm">{voteCount}</span>}
    </button>
  );
}
