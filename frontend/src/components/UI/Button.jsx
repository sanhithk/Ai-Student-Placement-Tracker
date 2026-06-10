import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary-600 text-slate-900 dark:text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-slate-100 dark:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-primary-500",
    danger: "bg-red-600 text-slate-900 dark:text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-slate-600 dark:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-50 dark:bg-slate-800 focus:ring-slate-500"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
