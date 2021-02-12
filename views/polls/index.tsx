import { useState } from "react";
import styles from "./Polls.module.css";

function PollChoice({ id, index }: { id: string; index: number }) {
  const label = `Choice ${index + 1}`;

  return (
    <div>
      <label className="flex" htmlFor={id}>
        {label}
      </label>
      <input
        className="w-full border border-gray-300 rounded-md bg-gray-50 px-4 py-2"
        type="text"
        id={id}
      />
    </div>
  );
}

export default function PollsView() {
  const [choices, choicesSet] = useState(2);

  const addChoice = () => choicesSet((num) => num + 1);
  const canAddMoreChoices = choices < 4;

  return (
    <main className={styles.main}>
      <div className={styles.app}>
        <div className="flex-1 p-4">
          <div className="flex">
            <div className="flex-1 space-y-4">
              {new Array(choices).fill("").map((_, i) => (
                <PollChoice id={`choice-${i}`} index={i} />
              ))}
            </div>

            <div className="w-12 flex items-end justify-end">
              {canAddMoreChoices && (
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300"
                  onClick={addChoice}
                ></button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-300">
          <div className="flex">
            <div className="flex-1">
              <label htmlFor="length">
                Poll length <span className="text-gray-400">(minutes)</span>
              </label>
            </div>

            <select
              className="border border-gray-300 rounded-md bg-gray-50 px-4 py-2 appearance-none"
              name="length"
              id="length"
            >
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-300">
          <button className="w-full p-4 text-center font-medium text-purple-500 hover:bg-purple-50">
            Start Poll
          </button>
        </div>
      </div>
    </main>
  );
}
