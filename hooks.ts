import { getUser, User } from "@soapboxsocial/minis.js";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

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

/**
 *
 * @param callback
 * @param delay Delay amount in seconds
 */
export function useInterval(callback: Function, delay: number) {
  const savedCallback = useRef<Function>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay * 1000);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const getTriviaCategories = async () => {
  type Data = {
    trivia_categories: {
      id: number;
      name: string;
    }[];
  };

  const r = await fetch(`https://opentdb.com/api_category.php`);

  const { trivia_categories }: Data = await r.json();

  const cleaned = trivia_categories.map((val) => ({
    label: val.name.replace("Entertainment:", "").replace("Science:", ""),
    value: val.id.toString(),
  }));

  return cleaned;
};

export function useTriviaCategories() {
  const { data } = useSWR("TriviaCategories", getTriviaCategories);

  return data;
}
