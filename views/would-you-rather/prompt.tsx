import cn from "classnames";
import { CheckCircle } from "react-feather";

type Props = {
  active?: boolean;
  className?: string;
  disabled?: boolean;
  id: string;
  onClick: () => void;
  percent: number;
  ringColor: string;
  text: string;
};

export default function Prompt({
  active,
  className = "",
  disabled = false,
  onClick,
  percent,
  ringColor,
  text,
}: Props) {
  const cachedClassNames = cn(
    "relative flex-1 p-6 rounded flex items-center justify-center focus:outline-none focus:ring-4",
    className
  );

  return (
    <button onClick={onClick} disabled={disabled} className={cachedClassNames}>
      <div className="text-title3 text-black font-bold">{text}</div>

      <div className="absolute left-4 bottom-4">
        <span className="font-semibold leading-none text-black">
          {percent.toLocaleString("en-US", {
            style: "percent",
            maximumFractionDigits: 0,
          })}
        </span>
      </div>

      {active && (
        <div className="absolute right-2 top-2">
          <div className="flex -space-x-1">
            <div
              className={`p-1 bg-white text-black rounded-full ring-2 ${ringColor}`}
            >
              <CheckCircle size={16} />
            </div>
          </div>
        </div>
      )}
    </button>
  );
}
