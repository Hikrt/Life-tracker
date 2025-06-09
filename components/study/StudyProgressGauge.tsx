
import React, { useMemo } from 'react';
import { ProgressBar } from '../ui/ProgressBar';

interface StudyProgressGaugeProps {
  totalStudyHours: number;
  cfaTargetHours: number;
  cfaDeadlineDate: Date;
}

const StudyProgressGauge: React.FC<StudyProgressGaugeProps> = ({
  totalStudyHours,
  cfaTargetHours,
  cfaDeadlineDate,
}) => {
  const studyProgressPercent = useMemo(() => (totalStudyHours / cfaTargetHours) * 100, [totalStudyHours, cfaTargetHours]);
  
  const daysRemaining = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(cfaDeadlineDate);
    deadline.setHours(0,0,0,0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [cfaDeadlineDate]);

  const hoursNeededPerDay = useMemo(() => {
    const hoursRemaining = cfaTargetHours - totalStudyHours;
    if (hoursRemaining <= 0 || daysRemaining <= 0) return 0;
    return hoursRemaining / daysRemaining;
  }, [totalStudyHours, cfaTargetHours, daysRemaining]);

  const getProgressColor = (percentage: number): 'danger' | 'accent' | 'secondary' => {
    if (percentage < 33) return 'danger';
    if (percentage < 66) return 'accent';
    return 'secondary';
  };
  
  const projectedCompletionDate = useMemo(() => {
    if (totalStudyHours === 0) return "N/A (Start studying!)";
    const hoursPerDayCurrentPace = totalStudyHours / ((new Date().getTime() - new Date(cfaDeadlineDate.getFullYear()-1, 7, 1).getTime()) / (1000 * 60 * 60 * 24)); // Rough estimate
    if (hoursPerDayCurrentPace <=0) return "Keep logging hours!";

    const daysToTarget = (cfaTargetHours - totalStudyHours) / hoursPerDayCurrentPace;
    if (daysToTarget < 0) return "Goal Achieved or Surpassed!";
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + Math.ceil(daysToTarget));
    return completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  }, [totalStudyHours, cfaTargetHours, cfaDeadlineDate]);


  return (
    <div className="space-y-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
      <h4 className="text-md font-semibold text-center text-primary dark:text-blue-300">CFA L1 Study Progress</h4>
      <ProgressBar value={studyProgressPercent} color={getProgressColor(studyProgressPercent)} showPercentage height="h-3" />
      <div className="grid grid-cols-2 gap-x-4 text-xs text-center">
        <div>
          <p className="font-medium">{totalStudyHours.toFixed(1)} / {cfaTargetHours} hrs</p>
          <p className="text-gray-600 dark:text-gray-400">Logged</p>
        </div>
        <div>
          <p className="font-medium">{daysRemaining} days</p>
          <p className="text-gray-600 dark:text-gray-400">To Deadline ({cfaDeadlineDate.toLocaleDateString()})</p>
        </div>
      </div>
       <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
        Avg. <span className="font-semibold text-accent">{hoursNeededPerDay.toFixed(1)} hrs/day</span> needed.
      </p>
      <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
        Projected Finish: <span className="font-semibold text-secondary">{projectedCompletionDate}</span>
      </p>
    </div>
  );
};

export default StudyProgressGauge;
