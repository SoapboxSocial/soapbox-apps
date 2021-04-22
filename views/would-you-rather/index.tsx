import { onClose, User } from "@soapboxsocial/minis.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "react-feather";
import { io, Socket } from "socket.io-client";
import { CircleIconButton } from "../../components/inputs/button";
import { SERVER_BASE } from "../../constants";
import { useParams, useSession, useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";
import Prompt from "./prompt";

type WYROption = {
  text: string;
};

type WYRPair = {
  a: WYROption;
  b: WYROption;
};

interface WYREmitEvents {
  JOIN_GAME: (user: User) => void;
  VOTE: (vote: WYROption) => void;
  NEW_PROMPT: () => void;
  CLOSE_GAME: () => void;
}

interface WYRListenEvents {
  VOTES: (votes: WYROption[]) => void;
  PROMPT: (prompt: WYRPair | null) => void;
}

export function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<WYRListenEvents, WYREmitEvents>>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(`${SERVER_BASE}/wyr`, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function WouldYouRatherView() {
  const user = useSession();

  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();

  const socket = useSocket();

  const [prompt, promptSet] = useState<WYRPair>();
  const handlePrompt = useCallback((data: WYRPair) => {
    console.log("PROMPT", data);

    promptSet(data);
  }, []);

  const [votes, votesSet] = useState<WYROption[]>([]);
  const handleVotes = useCallback((data: WYROption[]) => {
    console.log("VOTES", data);

    votesSet(data);
  }, []);

  const emitNewPrompt = useCallback(() => {
    socket.emit("NEW_PROMPT");
  }, [socket]);

  const [votedPromptText, votedPromptTextSet] = useState<string>();

  useEffect(() => {
    votedPromptTextSet(null);
  }, [prompt]);

  const emitVote = useCallback(
    (option: WYROption) => {
      return () => {
        socket.emit("VOTE", option);

        votedPromptTextSet(option.text);
      };
    },
    [socket]
  );

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", user);

    socket.on("PROMPT", handlePrompt);
    socket.on("VOTES", handleVotes);

    return () => {
      socket.off("PROMPT", handlePrompt);
      socket.off("VOTES", handleVotes);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Derived Values
   */

  const votesCount = votes.length;

  const calcVotePercent = (option: WYROption) => {
    const optionVotes = votes?.filter((vote) => vote.text === option.text)
      .length;

    return votesCount > 0 ? optionVotes / votesCount : 0;
  };

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

  if (prompt)
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
                  onClick={emitNewPrompt}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <Prompt
            active={votedPromptText === prompt.a.text}
            className="bg-accent-pink"
            ringColor="ring-accent-pink"
            disabled={Boolean(votedPromptText)}
            onClick={emitVote(prompt.a)}
            percent={calcVotePercent(prompt.a)}
            text={prompt.a.text}
          />

          <div className="flex-grow-0 mx-auto -my-4 text-center h-12 w-12 flex items-center justify-center rounded-full bg-systemGrey6-light dark:bg-black text-primary leading-none font-bold z-50 pointer-events-none select-none">
            OR
          </div>

          <Prompt
            active={votedPromptText === prompt.b.text}
            className="bg-accent-cyan"
            ringColor="ring-accent-cyan"
            disabled={Boolean(votedPromptText)}
            onClick={emitVote(prompt.b)}
            percent={calcVotePercent(prompt.b)}
            text={prompt.b.text}
          />
        </div>
      </main>
    );

  return <LoadingView />;
}
