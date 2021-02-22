import { useList, useMap, usePresence } from "@roomservice/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Plus } from "react-feather";
import { useForm } from "react-hook-form";
import Button, { CircleIconButton } from "../../components/inputs/button";
import Input from "../../components/inputs/input";

function CreatePollForm() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [, list] = useList(roomServiceRoomName, "poll");

  const [choices, choicesSet] = useState(2);

  const addChoice = () => choicesSet((num) => num + 1);
  const canAddMoreChoices = choices < 4;

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: { [key: string]: string }) => {
    try {
      console.log(data);

      const items = Object.values(data)
        .map((val, i) => ({
          label: Object.keys(data)[i],
          value: val,
          votes: 0,
        }))
        .filter((option) => !!option.value);

      list.push(items);
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
                        <span className="secondary">(optional)</span>
                      )}
                    </span>
                  </label>
                  <Input
                    id={id}
                    name={id}
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
              <CircleIconButton
                type="button"
                icon={<Plus />}
                onClick={addChoice}
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button type="submit">Start Poll</Button>
      </div>
    </form>
  );
}

function useSoapboxRoomId() {
  const { query } = useRouter();

  return query?.roomID || null;
}

export default function PollsView() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [poll, list] = useList(roomServiceRoomName, "poll");

  const deletePoll = () => {};

  const [joined, joinedClient] = usePresence(roomServiceRoomName, "joined");

  useEffect(() => {
    joinedClient.set(true);
  }, []);

  console.log(joined);

  const voteOnPoll = (label: string) => () => {
    const updatedItems = room.poll.map((item) => {
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

  console.log({ poll });

  const votesCount = poll?.reduce((acc: number, curr) => acc + curr.votes, 0);

  if (poll.length === 0) return <CreatePollForm />;

  if (poll.length > 0)
    return (
      <>
        <div className="p-4 flex justify-between items-center">
          <div className="text-xl font-bold">Polls</div>

          {/* <Users /> */}
        </div>

        <ul className="flex-1 px-4 space-y-4">
          {poll.map(
            (item: { label: string; value: string; votes: number }, i) => {
              console.log(item);

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
          <div className="secondary">
            {votesCount > 1 || votesCount === 0
              ? `${votesCount} votes`
              : `${votesCount} vote`}
          </div>

          <button
            className="text-systemRed-light dark:text-systemRed-dark font-medium"
            onClick={deletePoll}
          >
            Delete Poll
          </button>
        </div>
      </>
    );

  return (
    <div className="flex-1 flex justify-center items-center">
      <p>Waiting for the poll to be created</p>
    </div>
  );
}
