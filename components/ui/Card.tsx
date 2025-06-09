
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  actions?: React.ReactNode; // e.g. buttons or links in the header
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, titleIcon, actions }) => {
  return (
    <div className={`bg-light-card dark:bg-dark-card shadow-lg rounded-xl p-4 md:p-6 transition-colors duration-300 high-contrast:bg-hc-card high-contrast:border high-contrast:border-hc-border ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 high-contrast:border-hc-border">
          <div className="flex items-center">
            {titleIcon && <span className="mr-2 text-primary dark:text-blue-400 high-contrast:text-hc-primary">{titleIcon}</span>}
            <h3 className="text-lg font-heading text-light-text dark:text-dark-text high-contrast:text-hc-text">{title}</h3>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
