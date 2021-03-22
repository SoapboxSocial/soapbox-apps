import { useList, useMap } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import { Fragment, useCallback, useEffect, useState } from "react";
import { ArrowRight } from "react-feather";
import { useInterval, useStateList } from "react-use";
import { CircleIconButton } from "../../components/inputs/button";
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
  seen: WYRPair[];
};

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
    map?.delete("votes");

    let unseen = prompts;

    if (wyr?.seen) {
      console.log("Seen Prompts", wyr?.seen.length);

      unseen = prompts.filter((_prompt) => {
        if (wyr.seen.includes(_prompt)) {
          return false;
        }

        return true;
      });
    }

    console.log("Unseen Prompts", unseen.length);

    const randomPrompt = unseen[getRandom(unseen.length)];

    map?.set("active", randomPrompt);

    map?.set("seen", [...(wyr?.seen ? wyr.seen : []), randomPrompt]);
  }, [map, wyr.seen]);

  useEffect(() => {
    if (isAppOpener) {
      console.log("Setup App");

      next();
    }
  }, [map]);

  useEffect(() => {
    if (typeof votedPromptText === "string") votedPromptTextSet(null);
  }, [wyr.active]);

  const [isMiniClosed, isMiniClosedSet] = useState(false);

  const setupMini = () => {
    map?.delete("seen");
    map?.delete("active");
    map?.delete("votes");

    next();
  };

  useEffect(() => {
    onClose(() => {
      map?.delete("seen");
      map?.delete("active");
      map?.delete("votes");

      isMiniClosedSet(true);
    });
  }, []);

  const votesCount = wyr?.votes?.length ?? 0;

  const calcVotePercent = (option: WYROption) => {
    const optionVotes = wyr?.votes?.filter((vote) => vote.text === option.text)
      .length;

    return votesCount > 0 ? optionVotes / votesCount : 0;
  };

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

            {isAppOpener && (
              <div className="absolute right-0 top-1/2 transform-gpu -translate-y-1/2">
                <CircleIconButton
                  icon={<ArrowRight size={20} />}
                  onClick={next}
                />
              </div>
            )}
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

  return <LoadingView restartCallback={isMiniClosed ? setupMini : null} />;
}
