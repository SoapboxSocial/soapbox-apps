import WerewolfView from "../../views/werewolf";
import Head from "next/head";

export default function Werewolf() {
  return (
    <div className="bg-black text-white font-mini-pixel text-3xl">
      <Head>
        <link
          as="font"
          crossOrigin="anonymous"
          href="/mini_pixel-7-webfont.woff"
          rel="preload"
          type="font/woff"
        />
      </Head>

      <WerewolfView />
    </div>
  );
}
