import { useMap } from "@roomservice/react";
import { useState } from "react";
import { Plus } from "react-feather";
import { useForm } from "react-hook-form";
import Button, { CircleIconButton } from "../../components/inputs/button";
import Input from "../../components/inputs/input";
import { useSoapboxRoomId } from "../../hooks";

export default function CreatePollForm() {
  const soapboxRoomId = useSoapboxRoomId();

  const roomServiceRoomName = `soapbox-mini-polls-${soapboxRoomId}`;

  const [, map] = useMap(roomServiceRoomName, "mypoll");

  const [pollOptions, pollOptionsSet] = useState(2);

  const addChoice = () => pollOptionsSet((num) => num + 1);
  const canAddMoreOptions = pollOptions < 4;

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
    <main className="flex flex-col min-h-screen">
      <div className="px-4 pt-4 flex justify-between items-center">
        <div className="text-title2 font-bold">Polls</div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 p-4 flex flex-col"
      >
        <div className="flex-1">
          <div className="flex">
            <div className="flex-1 space-y-4">
              {[...new Array(pollOptions)].map((_, i) => {
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
                      autoComplete="off"
                      ref={register({
                        required: !isOptional,
                      })}
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-12 flex items-end justify-end">
              {canAddMoreOptions && (
                <CircleIconButton
                  type="button"
                  icon={<Plus />}
                  onClick={addChoice}
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <Button type="submit">Start Poll</Button>
        </div>
      </form>
    </main>
  );
}
