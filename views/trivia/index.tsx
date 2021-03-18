import { useMap } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "react-feather";
import { CircleIconButton } from "../../components/inputs/button";
import { useParams, useSoapboxRoomId } from "../../hooks";
import getRandom from "../../lib/getRandom";
import { Question } from "../../pages/api/trivia/questions";
import LoadingView from "../loading";
import DOMPurify from "dompurify";

const getSessionToken = async () => {
  const r = await fetch("/api/trivia/session");

  const { token }: { success: boolean; token: string } = await r.json();

  return token;
};

const getQuestions = async (sessionToken?: string) => {
  const r = await fetch(`/api/trivia/questions?sessionToken=${sessionToken}`);

  const { results }: { results: Question[] } = await r.json();

  return results;
};

type TriviaState = {
  sessionToken: string;
  questions: Question[];
  active: Question;
};

export default function TriviaView() {
  const soapboxRoomId = useSoapboxRoomId();
  const { isAppOpener } = useParams();

  const roomServiceRoomName = `soapbox-mini-trivia-${soapboxRoomId}`;

  const [trivia, map] = useMap<TriviaState>(roomServiceRoomName, "trivia");

  console.log(trivia);

  const next = () => {
    try {
      const randomQuestion =
        trivia?.questions[getRandom(trivia?.questions?.length)];

      map.set("active", randomQuestion);
    } catch (error) {
      console.error(error);
    }
  };

  const initializeMini = async () => {
    console.log("[initializeMini]");

    if (map?.set) {
      const questions = await getQuestions();

      map.set("questions", questions);

      const randomQuestion = questions[getRandom(questions.length)];

      map.set("active", randomQuestion);
    }
  };

  useEffect(() => {
    if (isAppOpener) {
      initializeMini();
    }
  }, [map]);

  const restartMini = () => {
    console.log("[restartMini]");

    map?.delete("active");
    map?.delete("questions");
    map?.delete("sessionToken");

    initializeMini();
  };

  const [isMiniClosed, isMiniClosedSet] = useState(false);

  onClose(() => {
    console.log("[onClose]");

    map?.delete("active");
    map?.delete("questions");
    map?.delete("sessionToken");

    isMiniClosedSet(true);
  });

  if (trivia?.active)
    return (
      <main className="flex flex-col min-h-screen select-none">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">Trivia</h1>

            {isAppOpener && (
              <div className="absolute right-0 top-1/2 transform-gpu -translate-y-1/2">
                <CircleIconButton
                  icon={<ArrowRight size={20} onClick={next} />}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 flex items-center">
          <p
            className="text-body font-bold text-center"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(trivia.active.question),
            }}
          />
        </div>

        <div className="p-4 space-y-2">
          <button className="relative w-full flex-1 py-3 text-body text-black font-semibold rounded focus:outline-none focus:ring-4 bg-accent-cyan">
            True
          </button>

          <button className="relative w-full flex-1 py-3 text-body text-black font-semibold rounded focus:outline-none focus:ring-4 bg-accent-pink">
            False
          </button>
        </div>
      </main>
    );

  return <LoadingView restartCallback={isMiniClosed ? restartMini : null} />;
}
