import { useMap } from "@roomservice/react";
import { getMembers, User } from "@soapboxsocial/minis.js";
import { useEffect } from "react";
import { useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";

const getRandom = (max: number) => Math.floor(Math.random() * Math.floor(max));

export default function RandomView() {
  const soapboxRoomId = useSoapboxRoomId();
  const roomServiceRoomName = `soapbox-mini-random-${soapboxRoomId}`;

  const [random, map] = useMap<{ members: User[]; chosen: User }>(
    roomServiceRoomName,
    "random"
  );

  useEffect(() => {
    async function setMembers() {
      const members = await getMembers();

      map?.set("members", members);
      map?.set("chosen", members[getRandom(members.length)]);
    }

    setMembers();
  }, [map]);

  if (random?.chosen && random?.members)
    return (
      <div className="text-xs">
        <ul>
          <li>Members: {random.members.length}</li>

          <li>
            <pre>
              <code>{JSON.stringify(random.chosen, null, 2)}</code>
            </pre>
          </li>
        </ul>
      </div>
    );

  return <LoadingView />;
}
