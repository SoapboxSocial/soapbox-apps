type Props = {
  text: string;
  percent: number;
  onClick: () => void;
  disabled?: boolean;
};

export default function Prompt({
  text,
  percent,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex-1 p-8 rounded flex items-center justify-center bg-soapbox focus:outline-none focus:ring-4"
    >
      <div className="text-title3 text-white">{text}</div>

      <div className="absolute left-4 bottom-4">
        <span className="leading-none secondary">
          {percent.toLocaleString("en-US", {
            style: "percent",
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
    </button>
  );
}
