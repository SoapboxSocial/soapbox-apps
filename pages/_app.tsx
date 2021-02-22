import type { AppProps } from "next/dist/next-server/lib/router/router";
import "../styles/globals.css";

export default function SoapboxApp({ Component, pageProps }: AppProps) {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    // @ts-ignore
    window.webkit = {
      messageHandlers: {
        user: {
          postMessage: (payload: { sequence: number }) => {
            console.log(
              "Handling message handler 'user' with sequence",
              payload.sequence
            );
          },
        },
      },
    };
  }

  return <Component {...pageProps} />;
}
