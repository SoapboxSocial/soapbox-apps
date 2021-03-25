import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "react-feather";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: {
    value: any;
    label: string;
  }[];
}

const Select = forwardRef<HTMLSelectElement, Props>(function SelectElement(
  { options, ...rest },
  ref
) {
  return (
    <div className="div relative">
      <select
        className="py-4 pl-5 pr-10 w-full rounded bg-white dark:bg-systemGrey6-dark appearance-none focus:outline-none focus:ring-4"
        ref={ref}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-2 transform-gpu top-1/2 -translate-y-1/2">
        <ChevronDown />
      </div>
    </div>
  );
});

export default Select;
