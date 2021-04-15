import classNames from "classnames";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Trash2 } from "react-feather";

function ToolButton({
  isActive,
  onClick,
  children,
}: {
  isActive?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const cachedClassNames = classNames(
    "h-12 w-12 flex items-center justify-center rounded  text-body font-bold focus:outline-none focus:ring-4",
    isActive
      ? "bg-systemGrey6-dark dark:bg-white text-white dark:text-systemGrey6-dark"
      : "bg-white dark:bg-systemGrey6-dark text-systemGrey6-dark dark:text-white"
  );
  return (
    <button onClick={onClick} className={cachedClassNames}>
      {children}
    </button>
  );
}

const Brush = {
  S: () => <div className="h-1 w-1 rounded-full bg-current" />,
  M: () => <div className="h-2 w-2 rounded-full bg-current" />,
  L: () => <div className="h-4 w-4 rounded-full bg-current" />,
};

export default function CanvasToolbar({
  brushSizeSet,
  brushSize,
  handleClearCanvas,
}: {
  brushSizeSet: Dispatch<SetStateAction<"S" | "M" | "L">>;
  brushSize: "S" | "M" | "L";
  handleClearCanvas: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex space-x-4">
        <div className="flex-1 flex space-x-2">
          <ToolButton
            isActive={brushSize === "S"}
            onClick={() => brushSizeSet("S")}
          >
            <Brush.S />
          </ToolButton>

          <ToolButton
            isActive={brushSize === "M"}
            onClick={() => brushSizeSet("M")}
          >
            <Brush.M />
          </ToolButton>

          <ToolButton
            isActive={brushSize === "L"}
            onClick={() => brushSizeSet("L")}
          >
            <Brush.L />
          </ToolButton>
        </div>

        <ToolButton onClick={handleClearCanvas}>
          <Trash2 className="text-systemRed-light dark:text-systemRed-dark" />
        </ToolButton>
      </div>
    </div>
  );
}
