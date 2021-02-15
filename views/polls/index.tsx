import { useState } from "react";
import { ChevronDown, Plus } from "react-feather";
import styles from "./Polls.module.css";
import { useForm } from "react-hook-form";

function CreatePollForm() {
  const [choices, choicesSet] = useState(2);

  const addChoice = () => choicesSet((num) => num + 1);
  const canAddMoreChoices = choices < 4;

  const { register, handleSubmit } = useForm({
    defaultValues: { length: "5" },
  });

  const onSubmit = async (data: { [key: string]: string }) => {
    try {
      const pollLengthInMinutes = data.length;

      const pollItems = Object.values(data)
        .map((val, i) => ({
          label: Object.keys(data)[i],
          value: val,
        }))
        .filter((option) => !!option.value)
        .filter((option) => option.label !== "length");

      console.log({
        pollItems: pollItems,
        length: pollLengthInMinutes,
      });
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.app}>
      <div className="flex-1 p-4">
        <div className="flex">
          <div className="flex-1 space-y-4">
            {new Array(choices).fill("").map((_, i) => {
              const index = i + 1;
              const id = `choice-${index}`;

              const isOptional = index > 2;

              return (
                <div>
                  <label className="flex" htmlFor={id}>
                    <span>
                      {`Choice ${index} `}
                      {isOptional && (
                        <span className="text-gray-400">(optional)</span>
                      )}
                    </span>
                  </label>
                  <input
                    className={styles.input}
                    id={id}
                    name={id}
                    type="text"
                    ref={register({
                      required: !isOptional,
                    })}
                  />
                </div>
              );
            })}
          </div>

          <div className="w-12 flex items-end justify-end">
            {canAddMoreChoices && (
              <button
                type="button"
                className={styles.addMore}
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
              className={styles.select}
              name="length"
              id="length"
              ref={register}
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
        <button
          type="submit"
          className="w-full p-4 text-center font-medium text-soapbox"
        >
          Start Poll
        </button>
      </div>
    </form>
  );
}

export default function PollsView() {
  return (
    <main className={styles.main}>
      <CreatePollForm />
    </main>
  );
}
