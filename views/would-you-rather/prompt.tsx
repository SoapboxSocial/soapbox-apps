import cn from "classnames";
import { CheckCircle } from "react-feather";

type Props = {
  active?: boolean;
  className?: string;
  disabled?: boolean;
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
  text,
}: Props) {
  const cachedClassNames = cn(
    "relative flex-1 px-6 rounded flex items-center justify-center focus:outline-none focus:ring-4",
    className
  );

  return (
    <button onClick={onClick} disabled={disabled} className={cachedClassNames}>
      <div className="text-title3 text-black font-bold">{text}</div>

      <div className="absolute left-3 bottom-3 h-4 leading-none font-semibold text-black">
        {percent.toLocaleString("en-US", {
          style: "percent",
          maximumFractionDigits: 0,
        })}
      </div>

      {active && (
        <div className="absolute right-2 top-2 p-1 bg-white text-black rounded-full">
          <CheckCircle size={16} />
        </div>
      )}
    </button>
  );
}
