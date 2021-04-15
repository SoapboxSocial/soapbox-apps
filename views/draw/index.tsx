import { User } from "@soapboxsocial/minis.js";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Clock, RefreshCw, Trash2 } from "react-feather";
import io, { Socket } from "socket.io-client";
import title from "title";
import Canvas, { DrawOperation } from "../../components/draw/canvas";
import CanvasToolbar from "../../components/draw/canvasToolbar";
import GuessToolbar from "../../components/draw/guessToolbar";
import { useSession, useSoapboxRoomId } from "../../hooks";
import isEqual from "../../lib/isEqual";
import obfuscateWord from "../../lib/obfuscateWord";
import LoadingView from "../loading";

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

const ROUND_DURATION = 80;

export interface DrawListenEvents {
  DRAW_OPERATION: (drawOperation: DrawOperation) => void;
  NEW_PAINTER: ({ id, user }: { id: string; user: User }) => void;
  OLD_DRAW_OPERATIONS: (oldDrawOperations: DrawOperation[]) => void;
  SEND_WORD: ({ word }: { word?: string }) => void;
  TIME: (timeLeft: number) => void;
  WORDS: ({ words }: { words: string[] }) => void;
}

export interface DrawEmitEvents {
  CLEAR_CANVAS: () => void;
  CLOSE_GAME: () => void;
  DRAW_OPERATION: (drawOperation: DrawOperation) => void;
  GUESS_WORD: ({ guess }: { guess: string }) => void;
  JOIN_GAME: ({ user }: { user: User }) => void;
  REROLL_WORDS: () => void;
  SELECT_WORD: ({ word }: { word: string }) => void;
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

  const handleOptions = useCallback((data: { words: string[] }) => {
    console.log("[WORDS]", data);

    optionsSet(data.words);
  }, []);

  const [rerolls, rerollsSet] = useState(0);

  const canRerollOptions = rerolls < 3;

  const rerollOptions = useCallback(() => {
    rerollsSet((prev) => prev + 1);

    socket.emit("REROLL_WORDS");
  }, [socket]);

  const [word, wordSet] = useState<string>();

  const handleWord = useCallback((data: { word: string }) => {
    console.log("[SEND_WORD]", data);

    if (typeof data.word === "string") {
      wordSet(title(data.word));

      return;
    }

    wordSet(undefined);
  }, []);

  const obfuscatedWord = useMemo(() => obfuscateWord(word), [word]);

  const sendSelectedOption = useCallback(
    (word: string) => () => {
      socket.emit("SELECT_WORD", { word });
    },
    [socket]
  );

  const sendGuess = (input: string) => {
    socket.emit("GUESS_WORD", { guess: input });
  };

  const [isPainter, isPainterSet] = useState<boolean>(false);

  const [painter, painterSet] = useState<{ id: string; user: User }>();

  const handlePainter = useCallback(
    (data: { id: string; user: User }) => {
      console.log("[NEW_PAINTER]", data);

      if (isEqual(data.id, socket.id)) isPainterSet(true);

      painterSet(data);
    },
    [socket]
  );

  const [timer, timerSet] = useState<number>(ROUND_DURATION);

  const handleTimer = useCallback((timeLeft: number) => timerSet(timeLeft), []);

  const [drawOperation, drawOperationSet] = useState<DrawOperation>();
  const handleDrawOperation = useCallback((data: DrawOperation) => {
    drawOperationSet(data);
  }, []);

  const [oldDrawOperations, oldDrawOperationsSet] = useState<DrawOperation[]>(
    []
  );
  const handleOldDrawOperations = useCallback((data: DrawOperation[]) => {
    console.log("OLD_DRAW_OPERATIONS", data);
    oldDrawOperationsSet(data);
  }, []);

  const [brushSize, brushSizeSet] = useState<"S" | "M" | "L">("M");

  const handleCanvasOnChange = useCallback(
    (drawOperation: DrawOperation) => {
      if (typeof drawOperation === "undefined") {
        return;
      }

      socket.emit("DRAW_OPERATION", drawOperation);
    },
    [socket]
  );

  const handleClearCanvas = useCallback(() => {
    socket.emit("CLEAR_CANVAS");
  }, [socket]);

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", { user });

    socket.on("WORDS", handleOptions);
    socket.on("SEND_WORD", handleWord);
    socket.on("NEW_PAINTER", handlePainter);
    socket.on("TIME", handleTimer);
    socket.on("DRAW_OPERATION", handleDrawOperation);
    socket.on("OLD_DRAW_OPERATIONS", handleOldDrawOperations);

    return () => {
      socket.off("WORDS", handleOptions);
      socket.off("SEND_WORD", handleWord);
      socket.off("NEW_PAINTER", handlePainter);
      socket.off("TIME", handleTimer);
      socket.off("DRAW_OPERATION", handleDrawOperation);
      socket.off("OLD_DRAW_OPERATIONS", handleOldDrawOperations);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Game Has A Painter And We're It
   */
  if (!!painter && isPainter) {
    /**
     * We're Drawing A Word
     */
    if (typeof word === "string")
      return (
        <main className="flex flex-col min-h-screen select-none relative">
          <div className="p-4">
            <div className="relative">
              <p className="text-center text-body font-bold capitalize">
                {title(word)}
              </p>

              <div className="absolute left-0 top-1/2 transform-gpu -translate-y-1/2">
                <div className="flex items-center space-x-2">
                  <Clock size={20} />

                  <span className="font-bold">{timer}</span>
                </div>
              </div>
            </div>
          </div>

          <Canvas
            brushSize={brushSize}
            canvasTimestamp={0}
            color="#000000"
            drawOperation={drawOperation}
            oldDrawOperations={oldDrawOperations}
            onChange={handleCanvasOnChange}
          />

          <CanvasToolbar
            brushSize={brushSize}
            brushSizeSet={brushSizeSet}
            handleClearCanvas={handleClearCanvas}
          />
        </main>
      );

    /**
     * We're Selecting A Word
     */
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
            {options?.map((option) => (
              <li key={option}>
                <button
                  className="w-full bg-white dark:bg-systemGrey6-dark rounded text-center focus:outline-none focus:ring-4 py-3 text-title3 font-bold"
                  onClick={sendSelectedOption(option)}
                >
                  {title(option)}
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
  }

  /**
   * Game Has A Painter, And We're Not It Right Now
   */
  if (!!painter && !isPainter) {
    /**
     * Word Selected, We're Guessing The Word Now
     */
    if (typeof word === "string")
      return (
        <main className="flex flex-col min-h-screen select-none relative">
          <div className="p-4">
            <div className="relative">
              <p
                className="text-center text-body font-bold capitalize"
                style={{ letterSpacing: "0.25em" }}
              >
                {obfuscatedWord}
              </p>

              <div className="absolute left-0 top-1/2 transform-gpu -translate-y-1/2">
                <div className="flex items-center space-x-2">
                  <Clock size={20} />

                  <span className="font-bold">{timer}</span>
                </div>
              </div>
            </div>
          </div>

          <Canvas
            brushSize={brushSize}
            canvasTimestamp={0}
            color="#000000"
            disabled
            drawOperation={drawOperation}
            oldDrawOperations={oldDrawOperations}
            onChange={handleCanvasOnChange}
          />

          <GuessToolbar sendGuess={sendGuess} />
        </main>
      );

    /**
     * Waiting For Word To Be Selected
     */
    return (
      <main className="flex flex-col min-h-screen select-none relative">
        <div className="flex items-center justify-center flex-1 pt-4 px-4">
          <p className="text-title2 text-center">
            {painter.user.display_name} is choosing a word!
          </p>
        </div>
      </main>
    );
  }

  return <LoadingView />;
}
