import { useList, useMap, usePresence } from "@roomservice/react";
import { onClose } from "@soapboxsocial/minis.js";
import { useMemo, useState } from "react";
import { useSoapboxRoomId } from "../../hooks";
import CreatePollForm from "./createPollForm";

type PollOption = {
  label: string;
  value: string;
};

export default function PollsView() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [poll, map] = useMap<{ options?: PollOption[]; votes: any }>(
    roomServiceRoomName,
    "mypoll"
  );

  const [votes, list] = useList<PollOption[]>(
    roomServiceRoomName,
    "mypoll-votes"
  );

  const [hasVoted, hasVotedSet] = useState(false);

  const [voted, votedClient] = usePresence<boolean>(
    roomServiceRoomName,
    "mypoll-voted"
  );

  const voteOnPoll = (option: PollOption) => () => {
    hasVotedSet(true);

    votedClient.set(true);

    list.push(option);
  };

  /**
   * Used to cleanup the Room Service rooms
   */
  const deletePoll = () => {
    for (let i = 0; i < votes.length; i++) {
      list.delete(i);
    }

    map.delete("options");
  };

  onClose(deletePoll);

  const votesCount = votes.length;

  const formattedVotesCount = useMemo(
    () =>
      votesCount > 1 || votesCount === 0
        ? `${votesCount} votes`
        : `${votesCount} vote`,
    [votesCount]
  );

  if (poll.options)
    return (
      <main className="flex flex-col min-h-screen">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-title2 font-bold">Polls</h1>
        </div>

        <ul className="flex-1 px-4 space-y-4">
          {poll.options.map((option: PollOption, i) => {
            const optionVotes = votes.filter(
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

          <button className="text-soapbox font-medium" onClick={deletePoll}>
            New Poll
          </button>
        </div>
      </main>
    );

  return <CreatePollForm />;
}
