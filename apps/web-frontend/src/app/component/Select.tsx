'use client';

import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  wrapperClassName?: string;
  children: React.ReactNode;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({label, name, id, className, wrapperClassName, children, ...props}, ref) => {
    return (
      <div className={wrapperClassName}>
        <label htmlFor={id || name} className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
        <select
          id={id || name}
          name={name}
          ref={ref}
          className={`
            w-full p-2 border border-gray-300 rounded-md shadow-sm 
            focus:ring-green-500 focus:border-green-500 
            transition duration-150 ease-in-out
            bg-white
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;