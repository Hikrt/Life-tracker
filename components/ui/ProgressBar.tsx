
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'danger';
  showPercentage?: boolean;
  height?: string; // e.g., 'h-2', 'h-4'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = 'primary',
  showPercentage = false,
  height = 'h-2.5',
}) => {
  const cappedValue = Math.min(Math.max(value, 0), 100);

  const colorClasses = {
    primary: 'bg-primary high-contrast:bg-hc-primary',
    secondary: 'bg-secondary high-contrast:bg-hc-secondary',
    accent: 'bg-accent high-contrast:bg-hc-accent',
    danger: 'bg-red-500 high-contrast:bg-red-500',
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-light-text dark:text-dark-text high-contrast:text-hc-text">{label}</span>
          {showPercentage && <span className="text-sm font-medium text-light-text dark:text-dark-text high-contrast:text-hc-text">{cappedValue.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} high-contrast:bg-gray-700 high-contrast:border high-contrast:border-hc-border`}>
        <div
          className={`${colorClasses[color]} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${cappedValue}%` }}
        ></div>
      </div>
    </div>
  );
};
