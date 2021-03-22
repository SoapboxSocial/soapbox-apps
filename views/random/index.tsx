import { useMap } from "@roomservice/react";
import { getMembers, onClose, User } from "@soapboxsocial/minis.js";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "react-feather";
import { CircleIconButton } from "../../components/inputs/button";
import Spinner from "../../components/spinner";
import { useParams, useSoapboxRoomId } from "../../hooks";
import getRandom from "../../lib/getRandom";

type RandomMap = {
  chosen: User;
};

export default function RandomView() {
  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();
  const roomServiceRoomName = `soapbox-mini-random-${soapboxRoomId}`;

  const [random, map] = useMap<RandomMap>(roomServiceRoomName, "random");

  const [isLoading, isLoadingSet] = useState(false);

  const selectRandomUser = useCallback(async () => {
    map?.set("chosen", null);

    isLoadingSet(true);

    const members = await getMembers();

    map?.set("chosen", members[getRandom(members.length)]);

    isLoadingSet(false);
  }, [map]);

  useEffect(() => {
    if (!random?.chosen) {
      selectRandomUser();
    }
  }, [map, selectRandomUser]);

  useEffect(() => {
    onClose(() => {
      map?.delete("chosen");
    });
  }, []);

  return (
    <main className="relative grid place-items-center min-h-screen">
      <div className="absolute top-4">
        <h1 className="text-title2 font-bold text-center">Random Person</h1>
      </div>

      {isAppOpener && (
        <div className="absolute top-4 right-4">
          <CircleIconButton
            loading={isLoading}
            type="button"
            icon={<RefreshCw size={20} />}
            onClick={selectRandomUser}
          />
        </div>
      )}

      <AnimatePresence>
        {random?.chosen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <img
              alt={random.chosen.display_name}
              className="w-24 h-24 rounded-full ring-4 ring-soapbox bg-soapbox"
              draggable={false}
              height={96}
              loading="eager"
              src={`https://cdn.soapbox.social/images/${random.chosen.image}`}
              width={96}
            />

            <p className="text-title2 font-bold text-center">
              {random.chosen.display_name}
            </p>
          </motion.div>
        ) : (
          <Spinner />
        )}
      </AnimatePresence>
    </main>
  );
}
