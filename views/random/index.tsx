import { useMap } from "@roomservice/react";
import { getMembers, User } from "@soapboxsocial/minis.js";
import { useEffect } from "react";
import { useSoapboxRoomId } from "../../hooks";
import LoadingView from "../loading";

export default function RandomView() {
  const soapboxRoomId = useSoapboxRoomId();
  const roomServiceRoomName = `soapbox-mini-random-${soapboxRoomId}`;

  const [random, map] = useMap<{ members: User[] }>(
    roomServiceRoomName,
    "random"
  );

  useEffect(() => {
    async function setMembers() {
      const members = await getMembers();

      map?.set("members", members);
    }

    setMembers();
  }, [map]);

  if (random?.members)
    return (
      <div className="text-xs">
        <ul>
          <li>Members: {random.members.length}</li>
          {random.members.map((member, i) => (
            <li key={i}>
              <pre>
                <code>{JSON.stringify(member, null, 2)}</code>
              </pre>
            </li>
          ))}
        </ul>
      </div>
    );

  return <LoadingView />;
}
