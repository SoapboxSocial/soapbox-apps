import { useMap } from "@roomservice/react";
import { getMembers, User } from "@soapboxsocial/minis.js";
import { useEffect } from "react";
import { useSoapboxRoomId } from "../../hooks";
import getRandom from "../../lib/getRandom";
import LoadingView from "../loading";

type RandomMap = {
  members: User[];
  chosen: User;
};

export default function RandomView() {
  const soapboxRoomId = useSoapboxRoomId();
  const roomServiceRoomName = `soapbox-mini-random-${soapboxRoomId}`;

  const [random, map] = useMap<RandomMap>(roomServiceRoomName, "random");

  useEffect(() => {
    async function selectRandomUser() {
      if (map?.set) {
        const members = await getMembers();

        map?.set("chosen", members[getRandom(members.length)]);
      }
    }

    selectRandomUser();
  }, [map]);

  if (random?.chosen)
    return (
      <main className="flex flex-col min-h-screen">
        <div className="pt-4 px-4">
          <div className="relative">
            <h1 className="text-title2 font-bold text-center">Random Person</h1>
          </div>
        </div>

        <div className="flex-1 p-4 flex justify-center items-center">
          <div className="space-y-4">
            <img
              alt={random.chosen.display_name}
              className="rounded-full ring-4 ring-soapbox"
              draggable={false}
              height={96}
              src="https://unsplash.it/192/192"
              width={96}
            />

            <p className="text-title1 font-bold text-center">
              {random.chosen.display_name}
            </p>
          </div>
        </div>
      </main>
    );

  return <LoadingView />;
}
