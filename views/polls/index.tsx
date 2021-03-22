import { useMap, usePresence } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";
import CreatePollForm from "./createPollForm";

type PollOption = {
  label: string;
  value: string;
};

type PollsMap = {
  options?: PollOption[];
  votes?: PollOption[];
};

type Props = {
  userID: string;
};

export default function PollsView({}: Props) {
  const soapboxRoomId = useSoapboxRoomId();
  const { isAppOpener } = useParams();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [poll, map] = useMap<PollsMap>(
    roomServiceRoomName,
    `${roomServiceRoomName}-poll`
  );

  const [hasVoted, hasVotedSet] = useState(false);

  const [voted, votedClient] = usePresence<boolean>(
    roomServiceRoomName,
    `${roomServiceRoomName}-voted`
  );

  const voteOnPoll = (option: PollOption) => () => {
    const curVotes = poll?.votes ? poll.votes : [];

    map.set("votes", [...curVotes, option]);

    votedClient.set(true);

    hasVotedSet(true);
  };

  useEffect(() => {
    hasVotedSet(false);
  }, [poll.options]);

  const deletePoll = () => {
    map?.delete("votes");
    map?.delete("options");
    hasVotedSet(false);
  };

  useEffect(() => {
    onClose(deletePoll);
  }, []);

  const votesCount = poll?.votes?.length ?? 0;

  const formattedVotesCount = useMemo(
    () =>
      votesCount > 1 || votesCount === 0
        ? `${votesCount} votes`
        : `${votesCount} vote`,
    [votesCount]
  );

  if (!poll?.options && isAppOpener)
    return <CreatePollForm roomServiceRoomName={roomServiceRoomName} />;

  if (poll?.options)
    return (
      <main className="flex flex-col min-h-screen">
        <ul className="flex-1 pt-4 px-4 space-y-4">
          {poll.options.map((option: PollOption, i) => {
            const optionVotes = poll?.votes?.filter(
              (vote) => vote.label === option.label
            ).length;

            const votePercent = votesCount > 0 ? optionVotes / votesCount : 0;

            const formattedVotePercent = votePercent.toLocaleString("en-US", {
              style: "percent",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <li key={i}>
                <button
                  className="w-full py-4 px-5 text-title3 bg-white dark:bg-systemGrey6-dark rounded flex justify-between focus:outline-none focus:ring-4"
                  onClick={voteOnPoll(option)}
                  disabled={hasVoted}
                >
                  <p className="leading-none">{option.value}</p>
                  <p className="leading-none">{formattedVotePercent}</p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="p-4 flex justify-between items-center">
          <div className="secondary">{formattedVotesCount}</div>

          {isAppOpener && (
            <button className="text-soapbox font-medium" onClick={deletePoll}>
              New Poll
            </button>
          )}
        </div>
      </main>
    );

  return <LoadingView />;
}
