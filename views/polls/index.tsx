import { onClose, User } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_BASE } from "../../constants";
import { useParams, useSession, useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";
import CreatePollForm from "./createPollForm";

export type PollOption = {
  label: string;
  value: string;
};

interface PollsListenEvents {
  VOTES: (votes: PollOption[]) => void;
  OPTIONS: (options: PollOption[]) => void;
}

interface PollsEmitEvents {
  CLOSE_GAME: () => void;
  JOIN_GAME: (user: User) => void;
  VOTE: (vote: PollOption) => void;
  SET_OPTIONS: (options: PollOption[]) => void;
  NEW_POLL: () => void;
}

export function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<PollsListenEvents, PollsEmitEvents>>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(`${SERVER_BASE}/polls`, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function PollsView() {
  const user = useSession();

  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();

  const socket = useSocket();

  const [options, optionsSet] = useState<PollOption[]>();
  const handleOptions = useCallback((data: PollOption[]) => {
    console.log("OPTIONS", data);

    optionsSet(data);
  }, []);

  const [votes, votesSet] = useState<PollOption[]>([]);
  const handleVotes = useCallback((data: PollOption[]) => {
    console.log("VOTES", data);

    votesSet(data);
  }, []);

  const emitSendOptions = useCallback(
    (options: PollOption[]) => {
      socket.emit("SET_OPTIONS", options);
    },
    [socket]
  );

  const emitNewPoll = useCallback(() => {
    socket.emit("NEW_POLL");
  }, [socket]);

  const [hasVoted, hasVotedSet] = useState(false);

  useEffect(() => {
    hasVotedSet(false);
  }, [options]);

  const emitVote = useCallback(
    (vote: PollOption) => {
      return () => {
        socket.emit("VOTE", vote);

        hasVotedSet(true);
      };
    },
    [socket]
  );

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", user);

    socket.on("OPTIONS", handleOptions);
    socket.on("VOTES", handleVotes);

    return () => {
      socket.off("OPTIONS", handleOptions);
      socket.off("VOTES", handleVotes);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Derived Values
   */
  const votesCount = useMemo(() => votes?.length ?? 0, [votes]);

  const formattedVotesCount = useMemo(() => {
    if (votesCount > 1 || votesCount === 0) {
      return `${votesCount} votes`;
    }

    return `${votesCount} vote`;
  }, [votesCount]);

  /**
   * Close Mini
   */
  useEffect(() => {
    if (soapboxRoomId && socket) {
      onClose(() => {
        socket.emit("CLOSE_GAME");
      });
    }
  }, [soapboxRoomId, socket]);

  if (!options && isAppOpener)
    return <CreatePollForm emitSendOptions={emitSendOptions} />;

  if (!!options)
    return (
      <main className="flex flex-col min-h-screen">
        <ul className="flex-1 pt-4 px-4 space-y-4">
          {options.map((option: PollOption, i) => {
            const optionVotes = votes?.filter(
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
                  onClick={emitVote(option)}
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
            <button className="text-soapbox font-medium" onClick={emitNewPoll}>
              New Poll
            </button>
          )}
        </div>
      </main>
    );

  return <LoadingView />;
}
