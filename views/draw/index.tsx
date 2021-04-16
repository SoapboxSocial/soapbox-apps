import { User } from "@soapboxsocial/minis.js";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import title from "title";
import Canvas2, { CanvasOperation } from "../../components/draw/canvas2";
import CanvasToolbar from "../../components/draw/canvasToolbar";
import ChooseWordPanel from "../../components/draw/chooseWordPanel";
import GuessToolbar from "../../components/draw/guessToolbar";
import Timer from "../../components/draw/timer";
import Spinner from "../../components/spinner";
import { useSession, useSoapboxRoomId } from "../../hooks";
import isEqual from "../../lib/isEqual";
import obfuscateWord from "../../lib/obfuscateWord";

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

type Painter = {
  id: string;
  user: User;
};

export interface DrawListenEvents {
  DRAW_OPERATION: (drawOperation: CanvasOperation) => void;
  NEW_PAINTER: ({ id, user }: { id: string; user: User }) => void;
  OLD_DRAW_OPERATIONS: (data: CanvasOperation[]) => void;
  SEND_WORD: ({ word }: { word?: string }) => void;
  TIME: (timeLeft: number) => void;
  UPDATE_CANVAS: ({ canvasTimestamp }: { canvasTimestamp: number }) => void;
  WORDS: ({ words }: { words: string[] }) => void;
}

export interface DrawEmitEvents {
  CLEAR_CANVAS: () => void;
  CLOSE_GAME: () => void;
  DRAW_OPERATION: (drawOperation: CanvasOperation) => void;
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

  /**
   * Listener Handlers
   */
  const [options, optionsSet] = useState<string[]>();
  const handleOptions = useCallback((data: { words: string[] }) => {
    optionsSet(data.words);
  }, []);

  const [word, wordSet] = useState<string>();
  const handleWord = useCallback((data: { word: string }) => {
    if (typeof data.word === "string") {
      wordSet(title(data.word));

      return;
    }

    wordSet(undefined);
  }, []);

  const [isPainter, isPainterSet] = useState<boolean>(false);
  const [painter, painterSet] = useState<Painter>();
  const handlePainter = useCallback(
    (data: Painter) => {
      if (isEqual(data.id, socket.id)) isPainterSet(true);

      painterSet(data);
    },
    [socket]
  );

  const [drawOperation, drawOperationSet] = useState<CanvasOperation>();
  const handleDrawOperation = useCallback((data: CanvasOperation) => {
    drawOperationSet(data);
  }, []);

  const [oldDrawOperations, oldDrawOperationsSet] = useState<CanvasOperation[]>(
    []
  );
  const handleOldDrawOperations = useCallback((data: CanvasOperation[]) => {
    oldDrawOperationsSet(data);
  }, []);

  const [canvasTimestamp, canvasTimestampSet] = useState(0);
  const handleUpdateCanvas = useCallback(
    (data: { canvasTimestamp: number }) => {
      canvasTimestampSet(data.canvasTimestamp);
    },
    []
  );

  /**
   * Setup Listeners
   */
  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.emit("JOIN_GAME", { user });

    socket.on("WORDS", handleOptions);
    socket.on("SEND_WORD", handleWord);
    socket.on("NEW_PAINTER", handlePainter);
    socket.on("DRAW_OPERATION", handleDrawOperation);
    socket.on("OLD_DRAW_OPERATIONS", handleOldDrawOperations);
    socket.on("UPDATE_CANVAS", handleUpdateCanvas);

    return () => {
      socket.off("WORDS", handleOptions);
      socket.off("SEND_WORD", handleWord);
      socket.off("NEW_PAINTER", handlePainter);
      socket.off("DRAW_OPERATION", handleDrawOperation);
      socket.off("OLD_DRAW_OPERATIONS", handleOldDrawOperations);
      socket.off("UPDATE_CANVAS", handleUpdateCanvas);

      socket.disconnect();
    };
  }, [user, socket]);

  /**
   * Emitters
   */
  const sendSelectedOption = useCallback(
    (word: string) => {
      return () => {
        if (typeof word === "undefined") {
          return;
        }

        socket.emit("SELECT_WORD", { word });
      };
    },
    [socket]
  );

  const sendRerollOptions = useCallback(() => {
    socket.emit("REROLL_WORDS");
  }, [socket]);

  const sendGuess = useCallback(
    (input: string) => {
      if (typeof input === "undefined") {
        return;
      }

      socket.emit("GUESS_WORD", { guess: input });
    },
    [socket]
  );

  const sendCanvasOperation = useCallback(
    (drawOperation: CanvasOperation) => {
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

  /**
   * Locking Body Scroll
   */
  const main = useRef<HTMLElement>();
  useEffect(() => {
    disableBodyScroll(main?.current);

    return () => {
      enableBodyScroll(main?.current);
    };
  }, [main]);

  /**
   * Canvas Tools
   */
  const [color, setColor] = useState("#000000");
  const [brushSize, brushSizeSet] = useState<"S" | "M" | "L">("M");

  /**
   * Derived Values
   */
  const obfuscatedWord = useMemo(() => obfuscateWord(word), [word]);

  return (
    <main
      ref={main}
      className="flex flex-col min-h-screen select-none relative"
    >
      {typeof word === "string" ? (
        <div className="p-4">
          <div className="relative">
            <p
              className="text-center text-body font-bold capitalize"
              style={{ letterSpacing: isPainter ? "0.02em" : "0.25em" }}
            >
              {isPainter ? title(word) : obfuscatedWord}
            </p>

            <div className="absolute left-0 top-1/2 transform-gpu -translate-y-1/2">
              <Timer socket={socket} />
            </div>
          </div>
        </div>
      ) : isPainter ? (
        <div className="p-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">
              Draw With Friends
            </h1>

            <div className="h-2" />

            <p className="text-body text-center">Choose a word to draw</p>
          </div>
        </div>
      ) : null}

      {typeof word === "string" ? (
        <Canvas2
          brushSize={brushSize}
          canvasTimestamp={canvasTimestamp}
          color={color}
          disabled={!isPainter}
          drawOperation={drawOperation}
          oldDrawOperations={oldDrawOperations}
          onChange={sendCanvasOperation}
        />
      ) : typeof painter === "object" ? (
        isPainter ? (
          <ChooseWordPanel
            options={options}
            sendRerollOptions={sendRerollOptions}
            sendSelectedOption={sendSelectedOption}
          />
        ) : (
          <div className="flex-1 px-4 flex items-center justify-center">
            <p className="text-title2 text-center">
              {painter.user.display_name} is choosing a word!
            </p>
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {typeof word === "string" ? (
        isPainter ? (
          <CanvasToolbar
            brushSize={brushSize}
            brushSizeSet={brushSizeSet}
            handleClearCanvas={handleClearCanvas}
            setColor={setColor}
          />
        ) : (
          <GuessToolbar sendGuess={sendGuess} />
        )
      ) : null}
    </main>
  );
}
