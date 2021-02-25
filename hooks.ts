import { getUser, User } from "@soapboxsocial/minis.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function useSession() {
  const [user, userSet] = useState<User>(null);

  useEffect(() => {
    async function getSession() {
      try {
        const _user = await getUser();

        userSet(_user);
      } catch (err) {
        console.error(err);
      }
    }

    if (typeof window !== "undefined") {
      getSession();
    }
  }, []);

  return user;
}

export function useSoapboxRoomId() {
  const { query } = useRouter();

  return query?.roomID || null;
}

export function useParams() {
  const { query } = useRouter();

  return {
    isAppOpener: Boolean(query?.isAppOpener),
  };
}
