import { useMap } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import cn from "classnames";
import DOMPurify from "dompurify";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "react-use";
import { useParams, useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";
import { useChannel, useEvent } from "@harelpls/use-pusher";

type Question = {
  category: string;
  type: "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: "True" | "False";
  incorrect_answers: ["True" | "False"];
};

type TriviaState = {
  active: Question;
  votes?: string[];
};

const TRIVIA_SERVER_BASE_URL = "http://localhost:8080";

export default function TriviaView() {
  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-trivia-${soapboxRoomId}`;

  const [activeQuestion, activeQuestionSet] = useState<Question>();

  /**
   * Change this to be based on room ID
   */
  const channel = useChannel("trivia");

  useEvent(channel, "question", (data: { question: Question }) =>
    activeQuestionSet(data.question)
  );

  const init = useCallback(async () => {
    console.log("[init]");

    try {
      await fetch(`${TRIVIA_SERVER_BASE_URL}/trivia/${soapboxRoomId}/setup`);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const [state, map] = useMap<TriviaState>(roomServiceRoomName, "trivia");

  const [isMiniClosed, isMiniClosedSet] = useState(false);

  onClose(async () => {
    console.log("[onClose]");

    activeQuestionSet(null);

    await fetch(`${TRIVIA_SERVER_BASE_URL}/trivia/reset`);

    isMiniClosedSet(true);
  });

  const [votedAnswer, votedAnswerSet] = useState<string>(null);

  useEffect(() => {
    if (typeof votedAnswer === "string") votedAnswerSet(null);
  }, [activeQuestion]);

  const [votes, votesSet] = useState<string[]>([]);

  const voteOnQuestion = (answer: string) => async () => {
    votedAnswerSet(answer);

    await fetch(`${TRIVIA_SERVER_BASE_URL}/trivia/${soapboxRoomId}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote: answer }),
      headers: { "Content-Type": "application/json" },
    });

    map.set("votes", [...votes, answer]);
  };

  const calcVoteCount = (answer: string) => {
    const answerVotes =
      state?.votes?.filter((vote) => vote === answer)?.length ?? 0;

    return answerVotes;
  };

  if (isAppOpener && !activeQuestion) {
    return (
      <main className="flex flex-col min-h-screen select-none">
        <button onClick={init}>Setup Trivia</button>
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
  type Data = {
    timer: number;
  };

  const duration = 30;

  const [timer, timerSet] = useState(0);

  const channel = useChannel("trivia");

  useEvent(channel, "timer", (data: Data) => timerSet(data.timer));

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
