import type { AppProps } from "next/dist/next-server/lib/router/router";
import { useSession } from "../hooks";
import "../styles/globals.css";

export default function SoapboxApp({ Component, pageProps }: AppProps) {
  const user = useSession();

  console.log({ user });

  return <Component {...pageProps} />;
}
