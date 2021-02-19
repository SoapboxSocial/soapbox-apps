import mitt from "mitt";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

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
  return {
    userID: 0,
    roomId: 0,
    isAdmin: false,
  };
}

type SoapboxEvent = {
  name: "APP_OPEN" | "USER_JOIN";
  userID: number;
  roomID: number;
  isAdmin?: boolean;
};

export function useWebViewEvents() {
  const emitter = mitt();

  const eventHandler = useCallback((event: MessageEvent<SoapboxEvent>) => {
    console.log("[EventHandler]", event);

    switch (event.data?.name) {
      case "APP_OPEN":
        console.log("APP_OPEN");

        break;

      case "USER_JOIN":
        console.log("USER_JOIN");

        break;

      default:
        break;
    }
  }, []);

  useEffect(() => {
    (window as any).mitt = emitter;

    emitter.on("foo", eventHandler);

    return () => {
      emitter.off("foo", eventHandler);
    };
  }, []);
}
