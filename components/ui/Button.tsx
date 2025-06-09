
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed high-contrast:focus:ring-offset-hc-bg high-contrast:disabled:opacity-60";

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-blue-600 text-white focus:ring-blue-500 high-contrast:bg-hc-primary high-contrast:text-hc-bg high-contrast:hover:opacity-80 high-contrast:focus:ring-hc-primary',
    secondary: 'bg-secondary hover:bg-green-600 text-white focus:ring-green-500 high-contrast:bg-hc-secondary high-contrast:text-hc-bg high-contrast:hover:opacity-80 high-contrast:focus:ring-hc-secondary',
    accent: 'bg-accent hover:bg-yellow-500 text-gray-900 focus:ring-yellow-400 high-contrast:bg-hc-accent high-contrast:text-hc-bg high-contrast:hover:opacity-80 high-contrast:focus:ring-hc-accent',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 high-contrast:bg-red-600 high-contrast:text-white high-contrast:hover:bg-red-700 high-contrast:focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-primary dark:text-blue-400 focus:ring-blue-500 border border-primary dark:border-blue-400 high-contrast:border-hc-primary high-contrast:text-hc-primary high-contrast:hover:bg-hc-primary high-contrast:hover:text-hc-bg high-contrast:focus:ring-hc-primary'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${variant === 'accent' ? 'text-gray-900' : 'text-white'} high-contrast:text-hc-bg`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
