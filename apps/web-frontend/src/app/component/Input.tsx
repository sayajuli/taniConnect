'use client'

import React from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  wrapperClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', label, name, id, className, wrapperClassName, ...props}, ref) => {
    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={id || name} className="block mb-1 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          type={type}
          id={id || name}
          name={name}
          ref={ref}
          className={`
            w-full p-2 border border-gray-300 rounded-md shadow-sm 
            focus:ring-green-500 focus:border-green-500 
            transition duration-150 ease-in-out
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;