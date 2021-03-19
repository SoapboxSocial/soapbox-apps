import { useMap } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import cn from "classnames";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useInterval } from "react-use";
import { useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";

type Question = {
  category: string;
  type: "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: "True" | "False";
  incorrect_answers: ["True" | "False"];
};

const getQuestion = async () => {
  type Data = {
    success: boolean;
    result: {
      active: Question;
      remaining: number;
    };
  };

  const r = await fetch(`http://localhost:8080/trivia/question`);

  const { result }: Data = await r.json();

  const { active } = result;

  return active;
};

type TriviaState = {
  active: Question;
  votes?: string[];
};

export default function TriviaView() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-trivia-${soapboxRoomId}`;

  const [state, map] = useMap<TriviaState>(roomServiceRoomName, "trivia");

  async function initializeMini() {
    console.log("[initializeMini]");

    if (typeof map !== "undefined") {
      try {
        const active = await getQuestion();

        map.set("active", active);
      } catch (error) {
        initializeMini();
        console.error(error);
      }
    }
  }

  useEffect(() => {
    if (!state?.active) {
      initializeMini();
    }
  }, [map]);

  const restartMini = () => {
    console.log("[restartMini]");

    map?.delete("active");
    map?.delete("votes");

    initializeMini();
  };

  const [isMiniClosed, isMiniClosedSet] = useState(false);

  onClose(() => {
    console.log("[onClose]");

    map?.delete("active");
    map?.delete("votes");

    isMiniClosedSet(true);
  });

  const [votedQuestion, votedQuestionSet] = useState<string>(null);

  useEffect(() => {
    if (typeof votedQuestion === "string") votedQuestionSet(null);
  }, [state.active]);

  const voteOnQuestion = (answer: string) => () => {
    votedQuestionSet(answer);

    const currentVotes = state?.votes ? state.votes : [];

    map.set("votes", [...currentVotes, answer]);
  };

  const calcVoteCount = (answer: string) => {
    const answerVotes =
      state?.votes?.filter((vote) => vote === answer)?.length ?? 0;

    return answerVotes;
  };

  if (state?.active)
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
              __html: DOMPurify.sanitize(state.active.question),
            }}
          />
        </div>

        <div className="p-4 space-y-2">
          <TriviaButton
            active={votedQuestion === "True"}
            correct={
              votedQuestion === "True" &&
              votedQuestion === state.active.correct_answer
            }
            disabled={votedQuestion}
            onClick={voteOnQuestion("True")}
            text="True"
            voteCount={calcVoteCount("True")}
          />

          <TriviaButton
            active={votedQuestion === "False"}
            correct={
              votedQuestion === "False" &&
              votedQuestion === state.active.correct_answer
            }
            disabled={votedQuestion}
            onClick={voteOnQuestion("False")}
            text="False"
            voteCount={calcVoteCount("False")}
          />
        </div>
      </main>
    );

  return <LoadingView restartCallback={isMiniClosed ? restartMini : null} />;
}

function Timer() {
  const duration = 10;

  /**
   * Hook up to Server
   */
  const [timer, timerSet] = useState(0);
  useInterval(async () => {
    if (timer === duration) {
      timerSet(0);
    } else {
      timerSet((prev) => prev + 1);
    }
  }, 1000);

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
