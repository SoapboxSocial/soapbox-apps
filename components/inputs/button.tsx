import type { ButtonHTMLAttributes, ReactElement } from "react";
import cn from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  small?: boolean;
}

export default function Button({ small, ...rest }: ButtonProps) {
  const classNames = cn(
    "w-full bg-soapbox rounded text-white text-center focus:outline-none focus:ring-4",
    small ? "py-2 text-body font-semibold" : "py-3 text-title2 font-bold"
  );

  return <button className={classNames} {...rest} />;
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
      {...rest}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-soapbox text-white focus:outline-none focus:ring-4"
    >
      <span className={buttonIconClassNames}>{icon}</span>
    </button>
  );
}
