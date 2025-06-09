
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, icon, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 high-contrast:text-hc-text">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm high-contrast:text-hc-text">{icon}</span>
          </div>
        )}
        <input
          id={id}
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${error ? 'border-red-500 high-contrast:border-red-500' : 'border-gray-300 dark:border-gray-600 high-contrast:border-hc-border'} rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent dark:bg-gray-700 text-light-text dark:text-dark-text high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:focus:ring-hc-primary high-contrast:focus:border-hc-primary ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 high-contrast:text-red-400">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 high-contrast:text-hc-text">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`block w-full px-3 py-2 border ${error ? 'border-red-500 high-contrast:border-red-500' : 'border-gray-300 dark:border-gray-600 high-contrast:border-hc-border'} rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent dark:bg-gray-700 text-light-text dark:text-dark-text high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:focus:ring-hc-primary high-contrast:focus:border-hc-primary ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 high-contrast:text-red-400">{error}</p>}
    </div>
  );
};
