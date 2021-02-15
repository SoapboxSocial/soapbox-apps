import { useState } from "react";
import styles from "./Polls.module.css";
import { Plus, ChevronDown } from "react-feather";

function PollChoice({ id, index }: { id: string; index: number }) {
  const label = `Choice ${index + 1}`;

  return (
    <div>
      <label className="flex" htmlFor={id}>
        <span>
          {label}{" "}
          {index + 1 > 2 ? (
            <span className="text-gray-400">(optional)</span>
          ) : null}
        </span>
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
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-soapbox bg-soapbox bg-opacity-20 focus:outline-none focus:ring-4"
                  onClick={addChoice}
                >
                  <Plus />
                </button>
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

            <div className="div relative">
              <select
                className="w-full border border-gray-300 rounded-md bg-gray-50 pl-4 pr-12 py-2 appearance-none"
                name="length"
                id="length"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
              <div className="pointer-events-none absolute right-2 transform-gpu top-1/2 -translate-y-1/2">
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300">
          <button className="w-full p-4 text-center font-medium text-soapbox">
            Start Poll
          </button>
        </div>
      </div>
    </main>
  );
}
