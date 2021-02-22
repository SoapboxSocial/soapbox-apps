import { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function InputElement(props, ref) {
  return (
    <input
      className="py-4 px-5 w-full rounded bg-white dark:bg-systemGrey6-dark"
      ref={ref}
      {...props}
    />
  );
});

export default Input;
