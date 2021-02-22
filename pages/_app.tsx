import type { AppProps } from "next/dist/next-server/lib/router/router";
import { useLayoutEffect } from "react";
import "../styles/globals.css";

export default function SoapboxApp({ Component, pageProps }: AppProps) {
  useLayoutEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      // @ts-ignore
      window.webkit = {
        messageHandlers: {
          user: {
            postMessage: (payload: { sequence: number }) => {
              console.log("[MessageHandler - user]", payload);

              setTimeout(() => {
                const user = {
                  display_name: "Jeff",
                  id: 70,
                  image: "fuck",
                  username: "jeff",
                };

                // @ts-ignore
                window.mitt.emit("user", {
                  sequence: payload.sequence,
                  data: user,
                });
              }, 1500);
            },
          },
        },
      };
    }
  }, []);

  return <Component {...pageProps} />;
}
