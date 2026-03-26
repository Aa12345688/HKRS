import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`flex w-full rounded-lg border bg-gray-900/50 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 
            focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5' 
              : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-600'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
