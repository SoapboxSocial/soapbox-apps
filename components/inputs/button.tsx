import type { ButtonHTMLAttributes, ReactElement } from "react";
import cn from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(props: ButtonProps) {
  return (
    <button
      className="w-full py-3 bg-soapbox rounded text-white text-center text-title2 font-bold focus:outline-none focus:ring-4"
      {...props}
    />
  );
}

interface CircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactElement;
  loading?: boolean;
}

export function CircleIconButton({
  icon,
  loading,
  ...rest
}: CircleButtonProps) {
  const buttonIconClassNames = cn({
    "animate-spin": loading,
  });

  return (
    <button
      className="w-8 h-8 flex items-center justify-center rounded-full bg-soapbox text-white focus:outline-none focus:ring-4"
      {...rest}
    >
      <span className={buttonIconClassNames}>{icon}</span>
    </button>
  );
}
