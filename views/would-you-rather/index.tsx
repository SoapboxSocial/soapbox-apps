import { useMap } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "react-use";
import { useParams, useSoapboxRoomId } from "../../hooks";
import getRandom from "../../lib/getRandom";
import prompts from "../../would-you-rather.json";
import LoadingView from "../loading";
import Prompt from "./prompt";

type WYROption = {
  text: string;
};

type WYRPair = {
  a: WYROption;
  b: WYROption;
};

type WouldYouRatherMap = {
  active: WYRPair;
  votes?: WYROption[];
  timeout: number;
};

const TIMEOUT = 20;

export default function WouldYouRatherView() {
  const soapboxRoomId = useSoapboxRoomId();
  const { isAppOpener } = useParams();

  const roomServiceRoomName = `soapbox-mini-wyr-${soapboxRoomId}`;

  const [wyr, map] = useMap<WouldYouRatherMap>(
    roomServiceRoomName,
    "wouldYouRather"
  );

  const [votedPromptText, votedPromptTextSet] = useState<string>(null);

  const next = useCallback(() => {
    votedPromptTextSet(null);

    map?.set("active", prompts[getRandom(prompts.length)]);
  }, [map]);

  useEffect(() => {
    if (isAppOpener && !wyr?.active) {
      next();

      map?.set("timeout", TIMEOUT);
    }
  }, [map, next]);

  useInterval(() => {
    if (isAppOpener) {
      if (wyr.timeout === 0) {
        next();

        map?.delete("votes");

        map?.set("timeout", TIMEOUT);
      } else {
        map?.set("timeout", wyr.timeout - 1);
      }
    }
  }, 1000);

  onClose(() => {
    map?.delete("active");
    map?.delete("votes");
    map?.delete("timeout");
  });

  const votesCount = wyr?.votes?.length ?? 0;

  const calcVotePercent = useCallback(
    (option: WYROption) => {
      const optionVotes = wyr?.votes?.filter(
        (vote) => vote.text === option.text
      ).length;

      return votesCount > 0 ? optionVotes / votesCount : 0;
    },
    [votesCount]
  );

  const voteOnOption = (option: WYROption) => () => {
    const currentVotes = wyr?.votes ? wyr.votes : [];

    map.set("votes", [...currentVotes, option]);

    votedPromptTextSet(option.text);
  };

  if (wyr?.active)
    return (
      <main className="flex flex-col min-h-screen select-none">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">
              Would You Rather
            </h1>

            <div className="absolute right-0 top-1/2 transform-gpu -translate-y-1/2">
              {wyr?.timeout > 0 ? `${wyr?.timeout}s` : "Up!"}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <Prompt
            active={votedPromptText === wyr.active.a.text}
            className="bg-accent-pink"
            ringColor="ring-accent-pink"
            disabled={Boolean(votedPromptText)}
            onClick={voteOnOption(wyr.active.a)}
            percent={calcVotePercent(wyr.active.a)}
            text={wyr.active.a.text}
          />

          <div className="flex-grow-0 mx-auto -my-4 text-center h-12 w-12 flex items-center justify-center rounded-full bg-systemGrey6-light dark:bg-black text-primary leading-none font-bold z-50 pointer-events-none select-none">
            OR
          </div>

          <Prompt
            active={votedPromptText === wyr.active.b.text}
            className="bg-accent-cyan"
            ringColor="ring-accent-cyan"
            disabled={Boolean(votedPromptText)}
            onClick={voteOnOption(wyr.active.b)}
            percent={calcVotePercent(wyr.active.b)}
            text={wyr.active.b.text}
          />
        </div>
      </main>
    );

  return <LoadingView />;
}
