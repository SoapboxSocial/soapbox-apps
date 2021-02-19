import { getUser, User } from "@soapboxsocial/minis.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function useUser() {
  const { query } = useRouter();

  return {
    userID: query?.userID || null,
    userRole: query?.userRole || null,
    isFirst: Boolean(query?.isFirst || null),
    roomId: query?.roomId || null,
  };
}

export function useSession() {
  const [user, userSet] = useState<User>(null);

  useEffect(() => {
    async function getSession() {
      const _user = await getUser();

      userSet(_user);
    }

    getSession();
  }, []);

  return user;
}
