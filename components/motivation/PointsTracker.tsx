
import React from 'react';
import { Card } from '../ui/Card';
import { TrophyIcon } from '../../constants';

interface PointsTrackerProps {
  currentPoints: number;
}

// Mock badges
const badges = [
  { id: 'b1', name: 'Early Riser', icon: '☀️', criteria: 'Complete 5 AM Quick-Hits' },
  { id: 'b2', name: 'Study Streak 7', icon: '📚', criteria: '7 consecutive study days' },
  { id: 'b3', name: 'Gym Rat', icon: '💪', criteria: '20 gym sessions logged' },
  { id: 'b4', name: 'Zen Master', icon: '🧘', criteria: '10 meditation sessions' },
  { id: 'b5', name: '100 Hour Club', icon: '💯', criteria: 'Log 100 study hours' },
];


export const PointsTracker: React.FC<PointsTrackerProps> = ({ currentPoints }) => {
  // Logic to determine unlocked badges based on points or other criteria would go here.
  // For simplicity, we'll just display a few.
  const unlockedBadges = badges.slice(0, Math.min(badges.length, Math.floor(currentPoints / 50))); // Unlock one badge per 50 points for demo

  return (
    <div className="space-y-6">
    <Card title="Achievements" titleIcon={<TrophyIcon className="text-accent high-contrast:text-hc-accent" />}>
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 high-contrast:text-gray-300">Total Points</p>
        <p className="text-5xl font-bold text-accent high-contrast:text-hc-accent">{currentPoints}</p>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-3 text-center high-contrast:text-hc-text">Badge Gallery</h4>
        {unlockedBadges.length === 0 && <p className="text-center text-gray-500 high-contrast:text-gray-300">Earn points to unlock badges!</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badges.map((badge, index) => (
            <div 
              key={badge.id} 
              className={`p-3 border rounded-lg text-center transition-all duration-300
                          ${index < unlockedBadges.length 
                            ? 'bg-yellow-100 dark:bg-yellow-800 border-yellow-400 shadow-md high-contrast:bg-hc-accent high-contrast:text-black high-contrast:border-hc-accent' 
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 high-contrast:bg-hc-bg high-contrast:border-hc-border high-contrast:opacity-60'}`}
            >
              <span className="text-4xl" role="img" aria-label={badge.name}>{badge.icon}</span>
              <p className={`text-sm font-medium mt-1 ${index < unlockedBadges.length ? 'high-contrast:text-black' : 'high-contrast:text-hc-text'}`}>{badge.name}</p>
              <p className={`text-xs text-gray-500 dark:text-gray-400 ${index < unlockedBadges.length ? 'high-contrast:text-gray-700' : 'high-contrast:text-gray-300'}`}>{badge.criteria}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
    </div>
  );
};
