import { useChannel, useEvent, usePusher } from "@harelpls/use-pusher";
import { onClose, User } from "@soapboxsocial/minis.js";
import cn from "classnames";
import DOMPurify from "dompurify";
import shuffle from "lodash.shuffle";
import type { Channel, PresenceChannel } from "pusher-js";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/inputs/button";
import Select from "../../components/inputs/select";
import {
  useParams,
  useSession,
  useSoapboxRoomId,
  useTriviaCategories,
} from "../../hooks";
import LoadingView from "../loading";

export type Question = {
  category: string;
  correct_answer: string;
  difficulty: "easy" | "medium" | "hard";
  incorrect_answers: string[];
  question: string;
  type: "boolean" | "multiple";
};

export type Vote = { answer: string; user: User };

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

export default function TriviaView() {
  const user = useSession();
  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();
  const channelName = `mini-trivia-${soapboxRoomId}`;

  const { client } = usePusher();
  const channel = useChannel(channelName);

  const categories = useTriviaCategories();

  const [category, categorySet] = useState<string>("all");
  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) =>
    categorySet(event.target.value);

  const init = useCallback(async () => {
    console.log("[init]");

    try {
      await fetch(
        `${SERVER_BASE}/trivia/${soapboxRoomId}/setup?category=${category}`
      );
    } catch (error) {
      console.error(error);
    }
  }, [category, soapboxRoomId]);

  /**
   * 'question' Event Handling
   */
  const [activeQuestion, activeQuestionSet] = useState<Question>();

  useEvent(channel, "question", (data: { question: Question }) => {
    console.log("Received 'question' event with payload", data);

    activeQuestionSet(data.question);
  });

  const questions = useMemo(() => {
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

  useEvent(channel, "vote", (data: { votes: Vote[] }) => {
    console.log("Received 'vote' event with payload", data);

    votesSet(data.votes);
  });

  /**
   * 'reveal' Event Handling
   */
  const [showAnswer, showAnswerSet] = useState(false);

  useEvent(channel, "reveal", () => {
    console.log("Received 'reveal' event");

    showAnswerSet(true);
  });

  useEffect(() => {
    showAnswerSet(false);
  }, [activeQuestion]);

  /**
   * 'scores' Event Handling
   */
  const [scores, scoresSet] = useState<{ [key: string]: number }>();

  useEvent(channel, "scores", (data: { scores: { [key: string]: number } }) => {
    console.log("Received 'scores' event with payload", data);

    scoresSet(data.scores);
  });

  /**
   * Voting Logic
   */
  const [votedAnswer, votedAnswerSet] = useState<string>(null);

  useEffect(() => {
    if (typeof votedAnswer === "string") votedAnswerSet(null);
  }, [activeQuestion]);

  const voteOnQuestion = (answer: string) => async () => {
    votedAnswerSet(answer);

    await fetch(`${SERVER_BASE}/trivia/${soapboxRoomId}/vote`, {
      method: "POST",
      body: JSON.stringify({ vote: { answer, user } }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const calcVoteCount = (answer: string) =>
    votes.filter((vote) => vote.answer === answer).length;

  /**
   * Mini Cleanup
   */
  const [isMiniClosed, isMiniClosedSet] = useState(false);

  useEffect(() => {
    if (soapboxRoomId) {
      onClose(async () => {
        isMiniClosedSet(true);

        activeQuestionSet(null);
        categorySet("all");
        scoresSet(null);
        showAnswerSet(false);
        votedAnswerSet(null);
        votesSet([]);

        await fetch(`${SERVER_BASE}/trivia/${soapboxRoomId}/reset`);

        client?.disconnect();
      });
    }
  }, [soapboxRoomId]);

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

              {Object.entries(scores)
                .map(([display_name, score]) => ({ display_name, score }))
                .sort((a, b) => b.score - a.score)
                .map((el, i) => (
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
          <div className="flex-1">
            <label className="flex mb-2" htmlFor="category">
              <span className="text-body">Choose a category</span>
            </label>

            <Select
              id="category"
              onChange={handleSelect}
              value={category}
              options={[{ label: "All", value: "all" }, ...categories]}
            />
          </div>

          <div className="pt-4">
            <Button onClick={init}>Start a round</Button>
          </div>
        </div>
      </main>
    );
  }

  if (activeQuestion)
    return (
      <main className="flex flex-col min-h-screen select-none relative">
        <Timer channel={channel} />

        <div className="flex-1 px-4 flex items-center justify-center">
          <p
            className="text-body font-bold text-center break-words"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(activeQuestion.question),
            }}
          />
        </div>

        <div className="px-4 pb-4 space-y-2">
          {questions.map((question) => (
            <TriviaButton
              active={votedAnswer === question}
              correct={question === activeQuestion.correct_answer}
              disabled={showAnswer || votedAnswer}
              key={question}
              onClick={voteOnQuestion(question)}
              reveal={showAnswer}
              voteCount={calcVoteCount(question)}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(question),
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

            {Object.entries(scores)
              .map(([display_name, score]) => ({ display_name, score }))
              .sort((a, b) => b.score - a.score)
              .map((el, i) => (
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

  return <LoadingView restartCallback={isMiniClosed ? init : null} />;
}

function Timer({ channel }: { channel: Channel & PresenceChannel }) {
  const [timer, timerSet] = useState(0);

  useEvent(channel, "timer", (data: { timer: number }) => {
    console.log("Received 'timer' event with payload", data);

    timerSet(data.timer);
  });

  const DURATION = 10;

  return (
    <div className="absolute top-0 right-0 left-0">
      <div
        className="h-1 bg-soapbox origin-left transition-transform ease-linear "
        style={{
          transform: `scaleX(${timer / DURATION})`,
          transitionDuration: "999ms",
        }}
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

      {disabled && (
        <span className="absolute transform-gpu right-4 top-1/2 -translate-y-1/2 text-sm">
          {voteCount}
        </span>
      )}
    </button>
  );
}
