import type { AppProps } from "next/dist/next-server/lib/router/router";
import { useWebViewEvents } from "../hooks";
import "../styles/globals.css";

export default function SoapboxApp({ Component, pageProps }: AppProps) {
  useWebViewEvents();

  return <Component {...pageProps} />;
}
