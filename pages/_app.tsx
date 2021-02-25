import type { AppProps } from "next/dist/next-server/lib/router/router";
import delay from "../lib/delay";
import "../styles/globals.css";

const USER = {
  display_name: "Jeff",
  id: 70,
  image: "fuck",
  username: "jeff",
};

export default function SoapboxApp({ Component, pageProps }: AppProps) {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    (window as any).webkit = {
      messageHandlers: {
        user: {
          postMessage: async (payload: { sequence: number }) => {
            console.log(
              "Handling message handler 'user' with sequence",
              payload.sequence
            );

            await delay(100);

            (window as any).mitt.emit("user", {
              sequence: payload.sequence,
              data: USER,
            });
          },
        },
        members: {
          postMessage: async (payload: { sequence: number }) => {
            console.log(
              "Handling message handler 'members' with sequence",
              payload.sequence
            );

            await delay(50);

            (window as any).mitt.emit("members", {
              sequence: payload.sequence,
              data: [
                {
                  display_name: "Jeff",
                  id: 70,
                  image: "fuck",
                  username: "jeff",
                },
                {
                  display_name: "Jack",
                  id: 71,
                  image: "fuck",
                  username: "jack",
                },
                {
                  display_name: "Dean",
                  id: 72,
                  image: "fuck",
                  username: "dean",
                },
                {
                  display_name: "Mike",
                  id: 73,
                  image: "fuck",
                  username: "mike",
                },
              ],
            });
          },
        },
        room: {
          postMessage: (payload: { sequence: number }) => {
            console.log(
              "Handling message handler 'room' with sequence",
              payload.sequence
            );
          },
        },
      },
    };
  }

  return <Component {...pageProps} />;
}
