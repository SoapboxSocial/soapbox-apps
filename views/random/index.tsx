import { getMembers, onClose, User } from "@soapboxsocial/minis.js";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "react-feather";
import { io, Socket } from "socket.io-client";
import { CircleIconButton } from "../../components/inputs/button";
import Spinner from "../../components/spinner";
import { SERVER_BASE } from "../../constants";
import { useParams, useSession, useSoapboxRoomId } from "../../hooks";

interface RandomEmitEvents {
  SEND_MEMBERS: (members: User[]) => void;
}

interface RandomListenEvents {
  MEMBER: (data: User | null) => void;
}

export function useSocket() {
  const soapboxRoomId = useSoapboxRoomId();

  const ref = useRef<Socket<RandomListenEvents, RandomEmitEvents>>();

  useEffect(() => {
    if (typeof soapboxRoomId === "string") {
      ref.current = io(`${SERVER_BASE}/random`, {
        query: {
          roomID: soapboxRoomId,
        },
      });
    }
  }, [soapboxRoomId]);

  return ref.current;
}

export default function RandomView() {
  const user = useSession();

  const { isAppOpener } = useParams();

  const soapboxRoomId = useSoapboxRoomId();

  const socket = useSocket();

  const [member, memberSet] = useState<User>();
  const handleMember = useCallback((data: User) => {
    memberSet(data);
  }, []);

  const emitSendMembers = useCallback(async () => {
    const members = await getMembers();

    socket.emit("SEND_MEMBERS", members);
  }, [socket]);

  useEffect(() => {
    if (!socket || !user) {
      return;
    }

    socket.on("MEMBER", handleMember);

    return () => {
      socket.off("MEMBER", handleMember);

      socket.disconnect();
    };
  }, [user, socket]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (isAppOpener) {
      emitSendMembers();
    }
  }, [socket, isAppOpener, emitSendMembers]);

  useEffect(() => {
    if (soapboxRoomId) {
      onClose(() => {
        memberSet(null);
      });
    }
  }, [soapboxRoomId]);

  return (
    <main className="relative grid place-items-center min-h-screen">
      {isAppOpener && (
        <div className="absolute top-4 right-4">
          <CircleIconButton
            type="button"
            icon={<RefreshCw size={20} />}
            onClick={emitSendMembers}
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
