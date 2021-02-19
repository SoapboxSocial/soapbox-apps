import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getUser, User } from "./lib/soapbox-minis-sdk";

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
      userSet(await getUser());
    }

    getSession();
  }, []);

  return user;
}
