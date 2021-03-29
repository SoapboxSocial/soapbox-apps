import { useChannel, useEvent, usePusher } from "@harelpls/use-pusher";
import { getMembers, onClose, User } from "@soapboxsocial/minis.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RefreshCw } from "react-feather";
import useSWR from "swr";
import { CircleIconButton } from "../../components/inputs/button";
import Spinner from "../../components/spinner";
import { useParams, useSoapboxRoomId } from "../../hooks";

const SERVER_BASE = process.env.NEXT_PUBLIC_APPS_SERVER_BASE_URL as string;

const getRandomMember = async (_: string, roomID: string) => {
  try {
    const members = await getMembers();

    await fetch(`${SERVER_BASE}/random/${roomID}/choose-member`, {
      method: "POST",
      body: JSON.stringify({ members: members }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
  }
};

function useRandomMember(roomID: string, isAppOpener: boolean) {
  const shouldFetch =
    typeof window !== "undefined" &&
    typeof roomID === "string" &&
    isAppOpener === true;

  return useSWR(
    shouldFetch ? ["RandomMember", roomID] : null,
    getRandomMember,
    {
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
}

export default function RandomView() {
  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();
  const channelName = `mini-random-${soapboxRoomId}`;

  const { client } = usePusher();
  const channel = useChannel(channelName);

  const { revalidate, isValidating } = useRandomMember(
    soapboxRoomId,
    isAppOpener
  );

  /**
   * 'member' Event Handling
   */
  const [member, memberSet] = useState<User>();

  useEvent(channel, "member", (data: { member: User }) => {
    console.log("Received 'member' event with payload", data);

    memberSet(data.member);
  });

  useEffect(() => {
    if (soapboxRoomId) {
      onClose(() => {
        memberSet(null);

        client?.disconnect();
      });
    }
  }, [soapboxRoomId]);

  return (
    <main className="relative grid place-items-center min-h-screen">
      {isAppOpener && (
        <div className="absolute top-4 right-4">
          <CircleIconButton
            loading={isValidating}
            type="button"
            icon={<RefreshCw size={20} />}
            onClick={revalidate}
          />
        </div>
      )}

      <AnimatePresence>
        {member ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <p className="text-6xl">👑</p>

            <img
              alt={member.display_name}
              className="w-24 h-24 rounded-full ring-4 ring-soapbox bg-soapbox"
              draggable={false}
              height={96}
              loading="eager"
              src={`https://cdn.soapbox.social/images/${member.image}`}
              width={96}
            />

            <p className="text-title2 font-bold text-center">
              {member.display_name}
            </p>
          </motion.div>
        ) : (
          <Spinner />
        )}
      </AnimatePresence>
    </main>
  );
}
