import { useMap } from "@roomservice/react";
import { useCallback, useState } from "react";
import { useStateList } from "react-use";
import Countdown from "../../components/countdown";
import { useInterval, useSoapboxRoomId } from "../../hooks";
import prompts from "../../would-you-rather.json";
import LoadingView from "../loading";
import Prompt from "./prompt";

type WYROption = {
  id: string;
  text: string;
};

type WouldYouRatherMap = {
  votes?: WYROption[];
};

const TIMEOUT = 15;

export default function WouldYouRatherView() {
  const soapboxRoomId = useSoapboxRoomId();
  const roomServiceRoomName = `soapbox-mini-wyr-${soapboxRoomId}`;

  const [wouldYouRather, map] = useMap<WouldYouRatherMap>(
    roomServiceRoomName,
    "wouldYouRather"
  );

  const { next, state: active } = useStateList(prompts);

  const [hasVoted, hasVotedSet] = useState(false);
  const [votedOption, votedOptionSet] = useState<string>(null);

  useInterval(() => {
    map.delete("votes");

    hasVotedSet(false);
    votedOptionSet(null);

    next();
  }, TIMEOUT);

  const votesCount = wouldYouRather?.votes?.length ?? 0;

  const calcVotePercent = useCallback(
    (option: WYROption) => {
      const optionVotes = wouldYouRather?.votes?.filter(
        (vote) => vote.id === option.id
      ).length;

      return votesCount > 0 ? optionVotes / votesCount : 0;
    },
    [votesCount]
  );

  const voteOnOption = (option: WYROption) => () => {
    const currentVotes = wouldYouRather?.votes ? wouldYouRather.votes : [];

    map.set("votes", [...currentVotes, option]);

    votedOptionSet(option.id);
    hasVotedSet(true);
  };

  if (map)
    return (
      <main className="flex flex-col min-h-screen">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">
              Would You Rather
            </h1>

            <div className="absolute right-0 top-1/2 transform-gpu  -translate-y-1/2">
              <Countdown timeout={TIMEOUT} />
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <Prompt
            active={votedOption === active.a.id}
            className="bg-accent-pink"
            disabled={hasVoted}
            onClick={voteOnOption(active.a)}
            percent={calcVotePercent(active.a)}
            text={active.a.text}
          />

          <div className="mx-auto -my-4 text-center h-12 w-12 flex items-center justify-center rounded-full bg-systemGrey6-light dark:bg-black text-primary leading-none font-bold z-50 pointer-events-none select-none">
            OR
          </div>

          <Prompt
            active={votedOption === active.b.id}
            className="bg-accent-cyan"
            disabled={hasVoted}
            onClick={voteOnOption(active.b)}
            percent={calcVotePercent(active.b)}
            text={active.b.text}
          />
        </div>
      </main>
    );

  return <LoadingView />;
}
