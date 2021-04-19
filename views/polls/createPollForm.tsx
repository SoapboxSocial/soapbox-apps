import { useState } from "react";
import { Plus } from "react-feather";
import { useForm } from "react-hook-form";
import { PollOption } from ".";
import Button, { CircleIconButton } from "../../components/inputs/button";
import Input from "../../components/inputs/input";

type Props = {
  emitSendOptions: (options: PollOption[]) => void;
};

export default function CreatePollForm({ emitSendOptions }: Props) {
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

      emitSendOptions(options);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
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

        <div className="pt-4">
          <Button type="submit">Start Poll</Button>
        </div>
      </form>
    </main>
  );
}
