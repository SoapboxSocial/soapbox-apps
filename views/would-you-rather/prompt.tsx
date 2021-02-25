import cn from "classnames";

type Props = {
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  percent: number;
  text: string;
};

export default function Prompt({
  className = "",
  disabled = false,
  onClick,
  percent,
  text,
}: Props) {
  const cachedClassNames = cn(
    "relative flex-1 p-8 rounded flex items-center justify-center focus:outline-none focus:ring-4",
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
    </button>
  );
}
