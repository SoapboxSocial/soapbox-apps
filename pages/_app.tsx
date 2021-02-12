import type { AppProps } from "next/dist/next-server/lib/router/router";
import "../styles/globals.css";

export default function SoapboxApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
