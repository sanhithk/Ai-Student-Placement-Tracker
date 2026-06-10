import React from 'react';

const Input = React.forwardRef(({ label, id, error, className = '', ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
