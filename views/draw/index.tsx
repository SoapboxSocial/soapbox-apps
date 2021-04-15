import { User } from "@soapboxsocial/minis.js";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RefreshCw } from "react-feather";
import io, { Socket } from "socket.io-client";
import Input from "../../components/inputs/input";
import { useSession, useSoapboxRoomId } from "../../hooks";
import isEqual from "../../lib/isEqual";
import LoadingView from "../loading";

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

export function Canvas() {
  return (
    <div>
      <canvas></canvas>
    </div>
  );
}

interface DrawListenEvents {
  WORDS: ({ words }: { words: string[] }) => void;
  SEND_WORD: ({ word }: { word: string }) => void;
  PAINTER_ID: ({ id }: { id: string }) => void;
}

interface DrawEmitEvents {
  JOIN_GAME: ({ user }: { user: User }) => void;
  CLOSE_GAME: () => void;
  REROLL_WORDS: () => void;
  SELECT_WORD: ({ word }: { word: string }) => void;
  GUESS_WORD: ({ guess }: { guess: string }) => void;
}

function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<DrawListenEvents, DrawEmitEvents>>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(SERVER_BASE, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function DrawView() {
  const user = useSession();

  const socket = useSocket();

  const [options, optionsSet] = useState<string[]>();
  const handleOptions = useCallback(
    ({ words }: { words: string[] }) => optionsSet(words),
    []
  );

  const [rerolls, rerollsSet] = useState(0);
  const canRerollOptions = rerolls < 3;
  const rerollOptions = useCallback(() => {
    rerollsSet((prev) => prev + 1);
    socket.emit("REROLL_WORDS");
  }, [socket]);

  const [word, wordSet] = useState<string>();
  const handleWord = useCallback(
    ({ word }: { word: string }) => wordSet(word),
    []
  );

  const sendSelectedOption = useCallback(
    (word: string) => () => {
      socket.emit("SELECT_WORD", { word });
    },
    [socket]
  );

  const [input, inputSet] = useState<string>();
  const onChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
    inputSet(currentTarget.value);

  const sendGuess = () => {
    if (typeof input === "undefined") {
      return;
    }

    socket.emit("GUESS_WORD", { guess: input });
  };

  const [painterID, painterIDSet] = useState<string>();
  const handlePainterID = useCallback(({ id }) => {
    console.log("PAINTER_ID", id);

    painterIDSet(id);
  }, []);

  const isPainter = useMemo(() => {
    if (typeof socket?.id === "string") {
      return isEqual(painterID, socket.id);
    }

    return false;
  }, [socket, painterID]);

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", { user });

    socket.on("WORDS", handleOptions);
    socket.on("SEND_WORD", handleWord);
    socket.on("PAINTER_ID", handlePainterID);

    return () => {
      socket.off("WORDS", handleOptions);
      socket.off("SEND_WORD", handleWord);
      socket.off("PAINTER_ID", handlePainterID);

      socket.disconnect();
    };
  }, [user, socket]);

  if (isPainter) {
    if (typeof word === "undefined")
      return (
        <main className="flex flex-col min-h-screen select-none relative">
          <div className="pt-4 px-4">
            <h1 className="text-title2 font-bold text-center">
              Draw With Friends
            </h1>

            <div className="h-2" />

            <p className="text-body text-center">Choose a word to draw</p>
          </div>

          <div className="flex-1 px-4 pt-4">
            <ul className="space-y-4">
              {options?.map((word) => (
                <li key={word}>
                  <button
                    className="w-full bg-white dark:bg-systemGrey6-dark rounded-large text-center focus:outline-none focus:ring-4 py-6 text-title3 font-bold capitalize"
                    onClick={sendSelectedOption(word)}
                  >
                    {word.toLowerCase()}
                  </button>
                </li>
              ))}
            </ul>

            <div className="h-4" />

            <div className="flex justify-center">
              {canRerollOptions && (
                <button
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-soapbox text-white focus:outline-none focus:ring-4"
                  type="button"
                  onClick={rerollOptions}
                >
                  <RefreshCw />
                </button>
              )}
            </div>
          </div>
        </main>
      );

    return (
      <main className="flex flex-col min-h-screen select-none relative">
        <div className="flex-1 p-4">
          <h1>DRAW {word}</h1>
        </div>
      </main>
    );
  }

  if (typeof word === "undefined") {
    return <LoadingView />;
  }

  return (
    <main className="flex flex-col min-h-screen select-none relative">
      <div className="flex-1">
        <p>{word}</p>
      </div>

      <div className="p-4">
        <div className="flex space-x-2">
          <Input
            className="py-3 px-5 w-full rounded bg-white dark:bg-systemGrey6-dark focus:outline-none focus:ring-4"
            value={input}
            onChange={onChange}
            type="text"
          />

          <button
            className="py-3 px-4 rounded bg-soapbox text-white text-body font-bold focus:outline-none focus:ring-4"
            onClick={sendGuess}
          >
            Guess
          </button>
        </div>
      </div>
    </main>
  );
}
