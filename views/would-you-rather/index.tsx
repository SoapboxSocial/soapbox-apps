import { useMap } from "@roomservice/react";
import { useCallback, useEffect, useState } from "react";
import { useInterval, useStateList } from "react-use";
import { useParams, useSoapboxRoomId } from "../../hooks";
import prompts from "../../would-you-rather.json";
import LoadingView from "../loading";
import Prompt from "./prompt";

type WYROption = {
  id: string;
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

  const { next, state } = useStateList(prompts);

  /**
   * Setup Initial WYR Pair
   */
  useEffect(() => {
    map?.set("active", state);
  }, [map]);

  const [votedPromptID, votedPromptIDSet] = useState<string>(null);

  useEffect(() => {
    if (isAppOpener) map?.set("timeout", TIMEOUT);
  }, [map]);

  useEffect(() => {
    if (wyr.timeout === 0) {
      votedPromptIDSet(null);
    }
  }, [wyr.timeout]);

  useInterval(() => {
    if (isAppOpener) {
      if (wyr.timeout === 0) {
        next();

        map?.set("active", state);

        map?.delete("votes");

        map?.set("timeout", TIMEOUT);
      } else {
        map?.set("timeout", wyr.timeout - 1);
      }
    }
  }, 1000);

  const votesCount = wyr?.votes?.length ?? 0;

  const calcVotePercent = useCallback(
    (option: WYROption) => {
      const optionVotes = wyr?.votes?.filter((vote) => vote.id === option.id)
        .length;

      return votesCount > 0 ? optionVotes / votesCount : 0;
    },
    [votesCount]
  );

  const voteOnOption = (option: WYROption) => () => {
    const currentVotes = wyr?.votes ? wyr.votes : [];

    map.set("votes", [...currentVotes, option]);

    votedPromptIDSet(option.id);
  };

  if (wyr?.active)
    return (
      <main className="flex flex-col min-h-screen">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">
              Would You Rather
            </h1>

            <div className="absolute right-0 top-1/2 transform-gpu -translate-y-1/2">
              {wyr?.timeout > 0 ? `${wyr?.timeout}s` : "Times Up!"}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <Prompt
            id={wyr.active.a.id}
            active={votedPromptID === wyr.active.a.id}
            className="bg-accent-pink"
            ringColor="ring-accent-pink"
            disabled={Boolean(votedPromptID)}
            onClick={voteOnOption(wyr.active.a)}
            percent={calcVotePercent(wyr.active.a)}
            text={wyr.active.a.text}
          />

          <div className="mx-auto -my-4 text-center h-12 w-12 flex items-center justify-center rounded-full bg-systemGrey6-light dark:bg-black text-primary leading-none font-bold z-50 pointer-events-none select-none">
            OR
          </div>

          <Prompt
            id={wyr.active.b.id}
            active={votedPromptID === wyr.active.b.id}
            className="bg-accent-cyan"
            ringColor="ring-accent-cyan"
            disabled={Boolean(votedPromptID)}
            onClick={voteOnOption(wyr.active.b)}
            percent={calcVotePercent(wyr.active.b)}
            text={wyr.active.b.text}
          />
        </div>
      </main>
    );

  return <LoadingView />;
}
