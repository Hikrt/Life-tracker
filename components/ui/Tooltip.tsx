
import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div 
          className={`absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-900 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {text}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 dark:bg-gray-900 transform rotate-45 
              ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
              ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
              ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
            `}
          ></div>
        </div>
      )}
    </div>
  );
};
