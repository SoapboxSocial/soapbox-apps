import { useState } from "react";
import { RefreshCw } from "react-feather";
import title from "title";

type Props = {
  options?: string[];
  sendSelectedOption: (word: string) => () => void;
  sendRerollOptions: () => void;
};

export default function ChooseWordPanel({
  options,
  sendSelectedOption,
  sendRerollOptions,
}: Props) {
  const [rerolls, rerollsSet] = useState(0);
  const canRerollOptions = rerolls < 3;

  const handleClick = () => {
    rerollsSet((prev) => prev + 1);

    sendRerollOptions();
  };

  return (
    <div className="flex-1 px-4">
      <ul className="space-y-4">
        {options?.map((option) => (
          <li key={option}>
            <button
              className="w-full bg-white dark:bg-systemGrey6-dark rounded text-center focus:outline-none focus:ring-4 py-3 text-title3 font-bold"
              onClick={sendSelectedOption(option)}
            >
              {title(option)}
            </button>
          </li>
        ))}
      </ul>

      <div className="h-4" />

      <div className="flex justify-center">
        {canRerollOptions && (
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full bg-soapbox text-white focus:outline-none focus:ring-4"
            type="button"
            onClick={handleClick}
          >
            <RefreshCw />
          </button>
        )}
      </div>
    </div>
  );
}
