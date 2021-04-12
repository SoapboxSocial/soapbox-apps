import { User } from "@soapboxsocial/minis.js";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";
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

interface PictionaryListenEvents {
  WORDS: ({ words }: { words: string[] }) => void;
  SEND_WORD: ({ word }: { word: string }) => void;
  PAINTER_ID: ({ id }: { id: string }) => void;
}

interface PictionaryEmitEvents {
  JOIN_GAME: ({ user }: { user: User }) => void;
  CLOSE_GAME: () => void;
  REROLL_WORDS: () => void;
  SELECT_WORD: ({ word }: { word: string }) => void;
  GUESS_WORD: ({ guess }: { guess: string }) => void;
}

function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<PictionaryListenEvents, PictionaryEmitEvents>>();

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

export default function PictionaryView() {
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
          <ul>
            {options?.map((word) => (
              <li key={word}>
                <button onClick={sendSelectedOption(word)}>{word}</button>
              </li>
            ))}

            {canRerollOptions && (
              <li>
                <button onClick={rerollOptions}>Re-Roll</button>
              </li>
            )}
          </ul>
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
        <div className="flex space-x-4">
          <input
            className="w-full"
            value={input}
            onChange={onChange}
            type="text"
          />

          <button onClick={sendGuess}>Guess</button>
        </div>
      </div>
    </main>
  );
}
