
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out">
      <div className={`bg-light-card dark:bg-dark-card p-5 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out w-full m-4 ${sizeClasses[size]} max-h-[90vh] flex flex-col high-contrast:bg-hc-card high-contrast:border-2 high-contrast:border-hc-border`}>
        {title && (
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 high-contrast:border-hc-border">
            <h3 className="text-xl font-heading text-light-text dark:text-dark-text high-contrast:text-hc-text">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors high-contrast:text-hc-text high-contrast:hover:text-hc-accent"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};
