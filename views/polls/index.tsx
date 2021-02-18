import { useMap } from "@roomservice/react";
import { useState } from "react";
import { ChevronDown, Plus } from "react-feather";
import { useForm } from "react-hook-form";
import { useUser } from "../../hooks";

function CreatePollForm() {
  const { roomId } = useUser();

  const [room, map] = useMap(`soapbox-mini-polls-${roomId}`, "poll");

  const [choices, choicesSet] = useState(2);

  const addChoice = () => choicesSet((num) => num + 1);
  const canAddMoreChoices = choices < 4;

  const { register, handleSubmit } = useForm({
    defaultValues: {
      length: "5",
    },
  });

  const onSubmit = async (data: { [key: string]: string }) => {
    try {
      const pollLengthInMinutes = data.length;

      const items = Object.values(data)
        .map((val, i) => ({
          label: Object.keys(data)[i],
          value: val,
          votes: 0,
        }))
        .filter((option) => !!option.value)
        .filter((option) => option.label !== "length");

      map.set("poll", {
        items,
        length: pollLengthInMinutes,
      });
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex">
          <div className="flex-1 space-y-4">
            {new Array(choices).fill("").map((_, i) => {
              const index = i + 1;
              const id = `choice-${index}`;

              const isOptional = index > 2;

              return (
                <div key={id}>
                  <label className="flex mb-2" htmlFor={id}>
                    <span className="text-body">
                      {`Choice ${index} `}
                      {isOptional && (
                        <span className="text-gray-400">(optional)</span>
                      )}
                    </span>
                  </label>
                  <input
                    className="py-4 px-5 w-full rounded bg-white dark:bg-systemGrey6-dark"
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
                className="w-8 h-8 flex items-center justify-center rounded-full bg-soapbox text-white focus:outline-none focus:ring-4"
                onClick={addChoice}
              >
                <Plus />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex">
          <div className="flex-1">
            <label className="text-body" htmlFor="length">
              Poll length <span className="text-gray-400">(minutes)</span>
            </label>
          </div>

          <div className="div relative">
            <select name="length" id="length" ref={register}>
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

      <div className="p-4">
        <button
          type="submit"
          className="w-full py-3 bg-soapbox rounded text-white text-center text-title2 font-bold"
        >
          Start Poll
        </button>
      </div>
    </form>
  );
}

export default function PollsView() {
  const { isFirst, roomId } = useUser();

  const [room, map] = useMap(`soapbox-mini-polls-${roomId}`, "poll");

  const deletePoll = () => map.delete("poll");

  const voteOnPoll = (label: string) => () => {
    const updatedItems = room.poll.items.map((item) => {
      if (item.label === label) {
        return {
          ...item,
          votes: item.votes + 1,
        };
      } else {
        return item;
      }
    });

    console.log(updatedItems);

    map.set("poll", {
      ...room.poll,
      items: updatedItems,
    });
  };

  const votesCount = room?.poll?.items?.reduce(
    (acc: number, curr) => acc + curr.votes,
    0
  );

  if (room?.poll)
    return (
      <>
        <div className="p-4 flex justify-between items-center">
          <div className="text-xl font-bold">Polls</div>

          {/* <Users /> */}
        </div>

        <ul className="flex-1 px-4 space-y-4">
          {room.poll.items.map(
            (item: { label: string; value: string; votes: number }, i) => {
              const votePercent = votesCount > 0 ? item.votes / votesCount : 0;

              const formattedVotePercent = votePercent.toLocaleString("en-US", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

              return (
                <li key={i}>
                  <button
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded flex justify-between"
                    onClick={voteOnPoll(item.label)}
                  >
                    <p className="leading-none">{item?.value}</p>
                    <p className="leading-none">{formattedVotePercent}</p>
                  </button>
                </li>
              );
            }
          )}
        </ul>

        <div className="p-4 flex justify-between items-center">
          <div className="text-gray-300">
            <span>
              {votesCount > 1 || votesCount === 0
                ? `${votesCount} votes`
                : `${votesCount} vote`}
            </span>
            <span className="px-1">·</span>
            <span>{room.poll.length} minutes left</span>
          </div>

          {isFirst && (
            <button
              className="text-systemRed-light dark:text-systemRed-dark font-medium"
              onClick={deletePoll}
            >
              Delete Poll
            </button>
          )}
        </div>
      </>
    );
  else if (isFirst) return <CreatePollForm />;

  return (
    <div className="flex-1 flex justify-center items-center">
      <p>Waiting for the poll to be created</p>
    </div>
  );
}
