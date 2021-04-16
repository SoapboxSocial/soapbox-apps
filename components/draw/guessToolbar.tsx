import { ChangeEvent, useState } from "react";

export default function GuessToolbar({
  sendGuess,
}: {
  sendGuess: (input: string) => void;
}) {
  const [input, inputSet] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputSet(event.target.value);
  };

  const handleSendGuess = () => {
    if (typeof input === "undefined") {
      return;
    }

    sendGuess(input);

    inputSet("");
  };

  return (
    <div className="p-4">
      <div className="flex space-x-2">
        <input
          className="py-3 px-4 w-full rounded bg-white dark:bg-systemGrey6-dark focus:outline-none focus:ring-4"
          onChange={handleChange}
          placeholder="Type your guess..."
          type="text"
          value={input}
        />

        <button
          className="py-3 px-4 rounded bg-soapbox text-white text-body font-bold focus:outline-none focus:ring-4"
          onClick={handleSendGuess}
          type="button"
        >
          Guess
        </button>
      </div>
    </div>
  );
}
