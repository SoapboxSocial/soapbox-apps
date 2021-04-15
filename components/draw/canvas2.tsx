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
  /**
   * Used to trigger 'CLEAR_CANVAS' events
   */
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

  useEffect(() => {
    if (parent && typeof oldDrawOperations === "undefined") {
      return;
    }

    console.log({ oldDrawOperations });

    setLines(oldDrawOperations);
  }, [parent, oldDrawOperations]);

  useEffect(() => {
    setLines([]);
  }, [canvasTimestamp]);

  useEffect(() => {
    if (!disabled && typeof drawOperation === "undefined") {
      return;
    }

    setLines([...lines, drawOperation]);
  }, [drawOperation]);

  const isDrawing = useRef(false);

  const handleMouseDown = (
    event:
      | KonvaEventObject<TouchEvent>
      | KonvaEventObject<globalThis.MouseEvent>
  ) => {
    isDrawing.current = true;

    const pos = event.target.getStage().getPointerPosition();

    setLines([
      ...lines,
      {
        stroke: color,
        points: [pos.x, pos.y],
        strokeWidth: BRUSHES[brushSize],
      },
    ]);
  };

  const handleMouseMove = (
    event:
      | KonvaEventObject<TouchEvent>
      | KonvaEventObject<globalThis.MouseEvent>
  ) => {
    if (!isDrawing.current || disabled) {
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

  const handleMouseUp = () => {
    isDrawing.current = false;

    onChange(lines.pop());
  };

  return (
    <div ref={parent} className="max-w-full bg-white flex-1 rounded-large">
      {parent && (
        <Stage
          // @ts-ignore
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleMouseMove}
          onTouchStart={handleMouseDown}
        >
          <Layer>
            {lines.map((line, i) => (
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
