import type { AppProps } from "next/dist/next-server/lib/router/router";
import delay from "../lib/delay";
import getRandom from "../lib/getRandom";
import "../styles/globals.css";

const getUserID = () => getRandom(1024);

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
              data: {
                display_name: "Jeff",
                id: getUserID(),
                image: "fuck",
                username: "jeff",
              },
            });
          },
        },
        members: {
          postMessage: async (payload: { sequence: number }) => {
            console.log(
              "Handling message handler 'members' with sequence",
              payload.sequence
            );

            await delay(200);

            (window as any).mitt.emit("members", {
              sequence: payload.sequence,
              data: [
                {
                  display_name: "Jeff",
                  id: getUserID(),
                  image: "jeff.png",
                  username: "jeff",
                },
                {
                  display_name: "Jack",
                  id: getUserID(),
                  image: "jack.png",
                  username: "jack",
                },
                {
                  display_name: "Dean",
                  id: getUserID(),
                  image: "dean.png",
                  username: "dean",
                },
                {
                  display_name: "Mike",
                  id: getUserID(),
                  image: "mike.png",
                  username: "mike",
                },
                {
                  display_name: "Roger",
                  id: getUserID(),
                  image: "roget.png",
                  username: "roger",
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
