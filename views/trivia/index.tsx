import { useChannel, useEvent } from "@harelpls/use-pusher";
import { onClose } from "@soapboxsocial/minis.js";
import cn from "classnames";
import DOMPurify from "dompurify";
import shuffle from "lodash.shuffle";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/inputs/button";
import Select from "../../components/inputs/select";
import { useParams, useSoapboxRoomId, useTriviaCategories } from "../../hooks";
import LoadingView from "../loading";

export type Question = {
  category: string;
  correct_answer: string;
  difficulty: "easy" | "medium" | "hard";
  incorrect_answers: string[];
  question: string;
  type: "boolean" | "multiple";
};

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

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

  const [votedAnswer, votedAnswerSet] = useState<string>(null);

  useEffect(() => {
    if (typeof votedAnswer === "string") votedAnswerSet(null);
  }, [activeQuestion]);

  const [votes, votesSet] = useState<string[]>([]);

  useEvent(channel, "vote", (data: { votes: string[] }) => {
    console.log("Received 'vote' event with payload", data);

    votesSet(data.votes);
  });

  const voteOnQuestion = (answer: string) => async () => {
    votedAnswerSet(answer);

    await fetch(`${SERVER_BASE}/trivia/${soapboxRoomId}/vote`, {
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

  useEffect(() => {
    onClose(async () => {
      isMiniClosedSet(true);

      activeQuestionSet(null);
      votedAnswerSet(null);
      categorySet("all");
      votesSet([]);

      await fetch(`${SERVER_BASE}/trivia/${soapboxRoomId}/reset`);
    });
  }, [soapboxRoomId]);

  if (!activeQuestion && isAppOpener && categories) {
    return (
      <main className="flex flex-col min-h-screen select-none">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">Trivia</h1>
          </div>
        </div>

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
        <Timer />

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
              correct={
                votedAnswer === question &&
                votedAnswer === activeQuestion.correct_answer
              }
              disabled={votedAnswer}
              onClick={voteOnQuestion(question)}
              key={question}
              text={question}
              voteCount={calcVoteCount(question)}
            />
          ))}
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
    console.log("Received 'timer' event with payload", data);

    timerSet(data.timer);
  });

  const DURATION = 15;

  return (
    <div className="absolute top-0 right-0 left-0">
      <div
        className="h-1 bg-soapbox"
        style={{ width: `${(timer / DURATION) * 100}%` }}
      />
    </div>
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
