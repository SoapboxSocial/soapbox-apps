import { useMap } from "@roomservice/react";
import { getMembers, User } from "@soapboxsocial/minis.js";
import { useCallback, useEffect } from "react";
import { RefreshCw } from "react-feather";
import { CircleIconButton } from "../../components/inputs/button";
import { useParams, useSoapboxRoomId } from "../../hooks";
import getRandom from "../../lib/getRandom";
import LoadingView from "../loading";

type RandomMap = {
  members: User[];
  chosen: User;
};

export default function RandomView() {
  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();
  const roomServiceRoomName = `soapbox-mini-random-${soapboxRoomId}`;

  const [random, map] = useMap<RandomMap>(roomServiceRoomName, "random");

  const selectRandomUser = useCallback(async () => {
    if (map?.set) {
      const members = await getMembers();

      map?.set("chosen", members[getRandom(members.length)]);
    }
  }, [map]);

  useEffect(() => {
    selectRandomUser();
  }, [map, selectRandomUser]);

  if (random?.chosen)
    return (
      <main className="relative grid place-items-center min-h-screen">
        <div className="absolute top-4">
          <h1 className="text-title2 font-bold text-center">Random Person</h1>
        </div>

        {isAppOpener && (
          <div className="absolute top-4 right-4">
            <CircleIconButton
              type="button"
              icon={<RefreshCw size={20} />}
              onClick={selectRandomUser}
            />
          </div>
        )}

        <div className="space-y-4">
          <img
            alt={random.chosen.display_name}
            className="rounded-full ring-4 ring-soapbox"
            draggable={false}
            height={96}
            loading="eager"
            src={`https://cdn.soapbox.social/images/${random.chosen.image}`}
            width={96}
          />

          <p className="text-title1 font-bold text-center">
            {random.chosen.display_name}
          </p>
        </div>
      </main>
    );

  return <LoadingView />;
}
