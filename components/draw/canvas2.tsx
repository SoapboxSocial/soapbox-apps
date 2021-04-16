import { KonvaEventObject } from "konva/types/Node";
import { useEffect, useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";
import { useMeasure } from "react-use";

type Props = {
  brushSize: "S" | "M" | "L";
  color: string;
  disabled?: boolean;
  drawOperation?: CanvasOperation;
  oldDrawOperations?: CanvasOperation[];
  onChange: (canvasOperation: CanvasOperation) => void;
  canvasTimestamp: number;
};

const BRUSHES = {
  S: 3,
  M: 6,
  L: 12,
};

export type CanvasOperation = {
  points: number[];
  stroke: string;
  strokeWidth: number;
};

type DrawEvent =
  | KonvaEventObject<TouchEvent>
  | KonvaEventObject<globalThis.MouseEvent>;

export default function Canvas2({
  brushSize,
  color,
  disabled,
  drawOperation,
  oldDrawOperations,
  onChange,
  canvasTimestamp,
}: Props) {
  const [parent, { width, height }] = useMeasure();

  const [lines, setLines] = useState<CanvasOperation[]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (typeof oldDrawOperations === "undefined") {
      return;
    }

    console.log("oldDrawOperation", oldDrawOperations);

    setLines(oldDrawOperations);
  }, [oldDrawOperations]);

  useEffect(() => {
    setLines([]);
  }, [canvasTimestamp]);

  useEffect(() => {
    if (!disabled || typeof drawOperation === "undefined") {
      return;
    }

    console.log("drawOperation", drawOperation);

    setLines((prev) => [...prev, drawOperation]);
  }, [drawOperation]);

  const startDraw = (event: DrawEvent) => {
    isDrawing.current = true;

    const pos = event.target.getStage().getPointerPosition();

    setLines((prev) => [
      ...prev,
      {
        stroke: color,
        points: [pos.x, pos.y],
        strokeWidth: BRUSHES[brushSize],
      },
    ]);
  };

  const draw = (event: DrawEvent) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = event.target.getStage();

    const point = stage.getPointerPosition();

    let lastLine = lines[lines.length - 1];

    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);

    setLines(lines.concat());
  };

  const endDraw = () => {
    isDrawing.current = false;

    onChange(lines[lines.length - 1]);
  };

  return (
    <div ref={parent} className="max-w-full bg-white flex-1 rounded-large">
      {parent && (
        <Stage
          width={width}
          height={height}
          onMouseDown={disabled ? undefined : startDraw}
          onTouchStart={disabled ? undefined : startDraw}
          onMouseMove={disabled ? undefined : draw}
          onTouchMove={disabled ? undefined : draw}
          onMouseUp={disabled ? undefined : endDraw}
          onTouchEnd={disabled ? undefined : endDraw}
        >
          <Layer>
            {lines?.map((line, i) => (
              <Line
                globalCompositeOperation="source-over"
                key={i}
                lineCap="round"
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
