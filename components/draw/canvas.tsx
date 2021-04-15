import {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const sizes = {
  S: 3,
  M: 6,
  L: 12,
};

export type DrawOperation = {
  previous: number[];
  current: number[];
  color: string;
  brushSize: "S" | "M" | "L";
};

function calcDrawPosition(
  event: MouseEvent | ReactMouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) {
  return [
    ((event.pageX - canvas.parentElement.offsetLeft) * canvas.width) /
      canvas.parentElement.offsetWidth +
      1,
    ((event.pageY - canvas.parentElement.offsetTop) * canvas.height) /
      canvas.parentElement.offsetHeight +
      1,
  ];
}

type Props = {
  brushSize: "S" | "M" | "L";
  color: string;
  disabled?: boolean;
  drawOperation?: DrawOperation;
  oldDrawOperations?: DrawOperation[];
  onChange: (DrawOperation: DrawOperation) => void;
  /**
   * Used to trigger 'CLEAR_CANVAS' events
   */
  canvasTimestamp: number;
};

export default function Canvas({
  brushSize,
  color,
  disabled,
  drawOperation,
  oldDrawOperations,
  onChange,
  canvasTimestamp,
}: Props) {
  const ref = useRef<HTMLCanvasElement>();

  const [previous, setPrevious] = useState<number[]>(null);
  const [current, setCurrent] = useState<number[]>(null);
  const [drawing, setDrawing] = useState(false);

  const paint = useCallback((drawOperation: DrawOperation) => {
    const ctx = ref.current.getContext("2d");

    ctx.strokeStyle = drawOperation.color;

    ctx.lineWidth = sizes[drawOperation.brushSize];

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(drawOperation.previous[0], drawOperation.previous[1]);

    ctx.lineTo(drawOperation.current[0], drawOperation.current[1]);

    ctx.stroke();

    ctx.closePath();
  }, []);

  const handleMouseUp = useCallback(() => {
    setDrawing(false);
    setCurrent(null);
    setPrevious(null);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!drawing) {
        return;
      }

      const drawPosition = calcDrawPosition(event, ref.current);

      setPrevious(current);

      setCurrent(drawPosition);
    },
    [drawing, current]
  );

  const handleTouchEnd = useCallback(() => handleMouseUp(), [handleMouseUp]);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!drawing) {
        return;
      }

      const touch = event.touches[0];

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });

      handleMouseMove(mouseEvent);
    },
    [drawing, handleMouseMove]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchEnd", handleTouchEnd);
    window.addEventListener("touchMove", handleTouchMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchEnd", handleTouchEnd);
      window.removeEventListener("touchMove", handleTouchMove);
    };
  }, [handleMouseUp, handleMouseMove, handleTouchEnd, handleTouchMove]);

  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    ctx.clearRect(0, 0, ref.current.width, ref.current.height);
  }, [canvasTimestamp]);

  useEffect(() => {
    if (typeof oldDrawOperations === "undefined") {
      return;
    }

    oldDrawOperations.forEach(paint);
  }, [oldDrawOperations, paint]);

  useEffect(() => {
    if (!drawing || disabled || !previous || !current) {
      return;
    }

    const drawOperation: DrawOperation = {
      previous,
      current,
      color,
      brushSize,
    };

    paint(drawOperation);

    onChange(drawOperation);
  }, [onChange, drawing, previous, current, color, disabled, paint, brushSize]);

  useEffect(() => {
    if (typeof drawOperation === "undefined") {
      return;
    }

    paint(drawOperation);
  }, [drawOperation, paint]);

  const handleMouseDown = useCallback(
    (event: MouseEvent | ReactMouseEvent<HTMLCanvasElement>) => {
      const drawPosition = calcDrawPosition(event, ref.current);

      setCurrent(drawPosition);

      setDrawing(true);
    },
    []
  );

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLCanvasElement>) => {
      const touch = event.touches[0];

      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });

      handleMouseDown(mouseEvent);
    },
    [handleMouseDown]
  );

  return (
    <canvas
      className="max-w-full bg-white flex-1 rounded-large"
      height="600"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      ref={ref}
      width="800"
    />
  );
}
