import { useSoapboxRoomId } from "../../hooks";
import Prompt from "./prompt";
import prompts from "../../would-you-rather.json";

export default function WouldYouRatherView() {
  const soapboxRoomId = useSoapboxRoomId();

  const activePrompt = prompts[0];

  const vote = (option: string) => () => {};

  // auto advance to next option after 15 / 30 seconds

  return (
    <main className="flex flex-col min-h-screen">
      <div className="pt-4 px-4">
        <h1 className="text-title2 font-bold text-center">Would You Rather</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <Prompt
          onClick={vote(activePrompt.a)}
          text={activePrompt.a}
          percent={0.4}
        />

        <div className="mx-auto -my-4 text-center h-12 w-12 flex items-center justify-center rounded-full bg-systemGrey6-light dark:bg-black text-primary leading-none font-bold z-50 pointer-events-none select-none">
          OR
        </div>

        <Prompt
          onClick={vote(activePrompt.b)}
          text={activePrompt.b}
          percent={0.6}
        />
      </div>
    </main>
  );
}
