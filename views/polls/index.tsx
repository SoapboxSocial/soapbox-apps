import { useList, useMap } from "@roomservice/react";
import { useState } from "react";
import { Plus } from "react-feather";
import { useForm } from "react-hook-form";
import Button, { CircleIconButton } from "../../components/inputs/button";
import Input from "../../components/inputs/input";
import { useSoapboxRoomId } from "../../hooks";

function CreatePollForm() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [, map] = useMap(roomServiceRoomName, "mypoll");

  const [choices, choicesSet] = useState(2);

  const addChoice = () => choicesSet((num) => num + 1);
  const canAddMoreChoices = choices < 4;

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: { [key: string]: string }) => {
    try {
      const options = Object.values(data).map((val, i) => ({
        label: Object.keys(data)[i],
        value: val,
      }));

      map.set("options", options);
    } catch (err) {
      console.error(err);
    }
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

type PollOption = {
  label: string;
  value: string;
};

export default function PollsView() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [poll, map] = useMap(roomServiceRoomName, "mypoll");

  // const [joined, joinedClient] = usePresence(roomServiceRoomName, "joined");

  // useEffect(() => {
  //   joinedClient.set(true);
  // }, []);

  // console.log(joined);

  const voteOnPoll = (label: string) => () => {};

  const deletePoll = () => map.delete("options");

  const votesCount = 0;

  if (poll.options)
    return (
      <>
        <div className="p-4 flex justify-between items-center">
          <div className="text-title2 font-bold">Polls</div>

          {/* <Users /> */}
        </div>

        <ul className="flex-1 px-4 space-y-4">
          {poll.options.map((item: PollOption, i) => {
            const votePercent = votesCount > 0 ? 0 / votesCount : 0;

            const formattedVotePercent = votePercent.toLocaleString("en-US", {
              style: "percent",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <li key={i}>
                <button
                  className="w-full py-4 px-5 text-title3 bg-white dark:bg-systemGrey6-dark rounded flex justify-between focus:outline-none focus:ring-4"
                  onClick={voteOnPoll(item.label)}
                >
                  <p className="leading-none">{item?.value}</p>
                  <p className="leading-none">{formattedVotePercent}</p>
                </button>
              </li>
            );
          })}
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

  return <CreatePollForm />;
}
