import { useState } from "react";
import { useInterval } from "../hooks";

type Props = { timeout: number };

export default function Countdown({ timeout }: Props) {
  const [remaining, remainingSet] = useState(timeout);

  useInterval(() => {
    if (remaining === 0) {
      remainingSet(timeout);
    } else {
      remainingSet((cur) => cur - 1);
    }
  }, 1);

  return <div className="w-6 h-6 border-4 border-soapbox rounded-full"></div>;
}
