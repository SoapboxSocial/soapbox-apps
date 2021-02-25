import cn from "classnames";
import { Check, CheckCircle, CheckSquare } from "react-feather";

type Props = {
  active?: boolean;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  percent: number;
  text: string;
};

export default function Prompt({
  active,
  className = "",
  disabled = false,
  onClick,
  percent,
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
        <span className="font-semibold text-black text-opacity-secondary leading-none">
          {percent.toLocaleString("en-US", {
            style: "percent",
            maximumFractionDigits: 0,
          })}
        </span>
      </div>

      {active && (
        <div className="absolute right-4 top-4">
          <div className="p-1.5 bg-white text-black rounded-full  shadow-lg">
            <CheckCircle size={16} />
          </div>
        </div>
      )}
    </button>
  );
}
