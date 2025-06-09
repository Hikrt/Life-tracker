import React, { useState } from 'react';
import { ScheduleActivity, ActivityType, SetActiveSection, ActiveSection } from '../../types';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { BookIcon, DumbbellIcon, MeditationIcon, FireIcon, ClockIcon, PlayIcon, ShieldExclamationIcon, CheckCircleIcon } from '../../constants'; 
import { Modal } from '../ui/Modal'; // Added for Nudge Modal

interface ActivityItemProps {
  activity: ScheduleActivity;
  isCompleted: boolean;
  onToggleComplete: () => void;
  currentTime: Date;
  setActiveSection: SetActiveSection;
}

const getActivityIcon = (type: ActivityType, className?: string) => {
  const iconClass = className || "w-5 h-5 mr-3";
  switch (type) {
    case ActivityType.STUDY: return <BookIcon className={`${iconClass} text-blue-500 dark:text-blue-400 high-contrast:text-hc-primary`} />;
    case ActivityType.GYM_WEIGHTS:
    case ActivityType.GYM_CARDIO: return <DumbbellIcon className={`${iconClass} text-green-500 dark:text-green-400 high-contrast:text-hc-secondary`} />;
    case ActivityType.HOME_WORKOUT: return <FireIcon className={`${iconClass} text-red-500 dark:text-red-400 high-contrast:text-hc-accent`} />;
    case ActivityType.MEDITATION: return <MeditationIcon className={`${iconClass} text-purple-500 dark:text-purple-400 high-contrast:text-hc-primary`} />;
    default: return <ClockIcon className={`${iconClass} text-gray-500 dark:text-gray-400 high-contrast:text-hc-text`} />;
  }
};

const getRelatedSectionTarget = (type: ActivityType): ActiveSection | null => {
  switch (type) {
    case ActivityType.STUDY: return 'study';
    case ActivityType.GYM_WEIGHTS: 
    case ActivityType.GYM_CARDIO: return 'gym';
    case ActivityType.HOME_WORKOUT: return 'quickhit';
    case ActivityType.MEDITATION: return 'meditation';
    case ActivityType.MEAL: return 'nutrition';
    default: return null;
  }
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, isCompleted, onToggleComplete, currentTime, setActiveSection }) => {
  const { name, time, type, details, startTime, endTime, isPotentiallyChallenging } = activity;
  const [showNudgeModal, setShowNudgeModal] = useState(false);

  const isCurrent = startTime && endTime && currentTime >= startTime && currentTime < endTime;
  const isUpcoming = startTime && currentTime < startTime;
  const isPast = endTime && currentTime > endTime;
  const targetSection = getRelatedSectionTarget(type);

  let itemStyle = "border-gray-200 dark:border-gray-700 high-contrast:border-hc-border";
  let statusText = "";
  let statusTextColor = "text-gray-500 dark:text-gray-400 high-contrast:text-gray-300";

  if (isCompleted) {
    itemStyle = "border-green-500 dark:border-green-600 opacity-60 high-contrast:border-hc-secondary high-contrast:opacity-70";
    statusText = "Completed";
    statusTextColor = "text-green-600 dark:text-green-400 high-contrast:text-hc-secondary";
  } else if (isCurrent) {
    itemStyle = "border-accent dark:border-yellow-400 ring-2 ring-accent dark:ring-yellow-400 shadow-lg high-contrast:border-hc-accent high-contrast:ring-hc-accent";
    statusText = "Current & Active";
    statusTextColor = "text-yellow-600 dark:text-yellow-400 high-contrast:text-hc-accent";
  } else if (isPast) {
     itemStyle = "border-red-300 dark:border-red-500 opacity-80 high-contrast:border-hc-accent high-contrast:opacity-80";
     statusText = "Past Due";
     statusTextColor = "text-red-500 dark:text-red-400 high-contrast:text-hc-accent";
  } else if (isUpcoming) {
     itemStyle = "border-blue-300 dark:border-blue-500 high-contrast:border-hc-primary";
     statusText = "Upcoming";
     statusTextColor = "text-blue-500 dark:text-blue-400 high-contrast:text-hc-primary";
  }


  return (
    <div className={`p-3 border-l-4 rounded-r-lg bg-light-bg dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 high-contrast:bg-hc-bg ${itemStyle}`}>
      <div className="flex items-start space-x-3">
        <div className="pt-1">
          <Tooltip text={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}>
            <button 
              onClick={onToggleComplete} 
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                          ${isCompleted 
                            ? 'bg-green-500 border-green-600 hover:bg-green-600 dark:bg-green-600 dark:border-green-700 high-contrast:bg-hc-secondary high-contrast:border-hc-secondary' 
                            : 'bg-transparent border-gray-400 hover:border-green-500 dark:border-gray-500 dark:hover:border-green-400 high-contrast:border-hc-border high-contrast:hover:border-hc-secondary'}`}
              aria-pressed={isCompleted}
              aria-label={isCompleted ? `Mark ${name} as incomplete` : `Mark ${name} as complete`}
            >
              {isCompleted && <CheckCircleIcon className="w-4 h-4 text-white high-contrast:text-hc-bg" />}
            </button>
          </Tooltip>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {getActivityIcon(type)}
              <h4 className="font-semibold text-light-text dark:text-dark-text high-contrast:text-hc-text">{name}</h4>
              {isPotentiallyChallenging && !isCompleted && (
                <Tooltip text="This task can be challenging. Stay focused!">
                  <ShieldExclamationIcon className="w-4 h-4 ml-2 text-orange-500 high-contrast:text-hc-accent" />
                </Tooltip>
              )}
            </div>
            <span className={`text-xs font-medium ${statusTextColor}`}>{statusText}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 high-contrast:text-gray-300">{time}</p>
          {details && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 high-contrast:text-gray-400">{details}</p>}
        </div>
        <div className="flex flex-col items-end space-y-1">
            {targetSection && (isCurrent || (isUpcoming && !isCompleted)) && (
                 <Tooltip text={`Go to ${type}`}>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveSection(targetSection)} 
                        className="p-1.5 high-contrast:text-hc-primary high-contrast:border-hc-primary"
                        aria-label={`Start ${name}`}
                    >
                        <PlayIcon className="w-4 h-4" />
                    </Button>
                 </Tooltip>
            )}
            {isPotentiallyChallenging && !isCompleted && isCurrent && (
                <Tooltip text="Need help with this task?">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNudgeModal(true)} 
                        className="p-1.5 text-orange-500 border-orange-500 dark:text-orange-400 dark:border-orange-400 high-contrast:text-hc-accent high-contrast:border-hc-accent"
                        aria-label="Get help for this challenging task"
                    >
                        ?
                    </Button>
                </Tooltip>
            )}
        </div>
      </div>
      {showNudgeModal && (
        <Modal isOpen={showNudgeModal} onClose={() => setShowNudgeModal(false)} title="Feeling Overwhelmed?">
          <div className="p-2 text-sm text-light-text dark:text-dark-text high-contrast:text-hc-text">
            <p className="mb-2">This task, <span className="font-semibold">{name}</span>, can sometimes be challenging. Here are a few tips:</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Break it down into smaller steps.</li>
              <li>Take a short 5-minute break before starting.</li>
              <li>Focus on just one aspect if the whole task feels too big.</li>
              <li>Remember why this is important to you.</li>
            </ul>
            <p>If you're really stuck, consider adjusting your approach or asking the AI Coach for specific advice related to this task type!</p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowNudgeModal(false)}>Got it!</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
