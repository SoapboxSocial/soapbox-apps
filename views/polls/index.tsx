import { useMap, usePresence } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import { useEffect, useMemo, useState } from "react";
import { useSoapboxRoomId } from "../../hooks";
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

export default function PollsView({ userID }: Props) {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [poll, map] = useMap<PollsMap>(
    roomServiceRoomName,
    `${roomServiceRoomName}-poll`
  );

  const [hasVoted, hasVotedSet] = useState(false);

  const [joined, joinedClient] = usePresence(
    roomServiceRoomName,
    `${roomServiceRoomName}-joined`
  );

  useEffect(() => {
    joinedClient.set("true");
  }, []);

  const [isAdmin, isAdminSet] = useState(false);

  useEffect(() => {
    if (
      Object.keys(joined).length === 1 &&
      Object.keys(joined).pop() === userID
    ) {
      isAdminSet(true);
    }
  }, [joined]);

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

  const deletePoll = () => {
    map.delete("votes");
    map.delete("options");

    hasVotedSet(false);
  };

  onClose(deletePoll);

  const votesCount = poll?.votes?.length ?? 0;

  const formattedVotesCount = useMemo(
    () =>
      votesCount > 1 || votesCount === 0
        ? `${votesCount} votes`
        : `${votesCount} vote`,
    [votesCount]
  );

  if (isAdmin && !poll?.options)
    return <CreatePollForm roomServiceRoomName={roomServiceRoomName} />;

  if (poll.options)
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

          {isAdmin && (
            <button className="text-soapbox font-medium" onClick={deletePoll}>
              New Poll
            </button>
          )}
        </div>
      </main>
    );

  return <LoadingView />;
}
