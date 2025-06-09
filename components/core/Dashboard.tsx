
import React, { useMemo, useState, useEffect } from 'react';
import { ScheduleActivity, ActivityType, SetActiveSection, Objective, KeyResult } from '../../types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { BookIcon, DumbbellIcon, MeditationIcon, FireIcon, ClockIcon, TrophyIcon, SparklesIcon, TargetIcon, ShieldExclamationIcon } from '../../constants';
import { ActivityItem } from './ActivityItem';
import { showNotification } from '../../services/notificationService';

interface DashboardProps {
  schedule: ScheduleActivity[];
  completedActivities: string[];
  markActivityCompleted: (activityId: string, points?: number) => void;
  totalStudyHours: number;
  cfaTargetHours: number;
  cfaDeadlineDate: Date;
  points: number;
  quickHitStreak: number;
  lastQuickHitDate: string | null;
  setActiveSection: SetActiveSection;
  objectives: Objective[]; // Objectives for the current quarter
}

const Dashboard: React.FC<DashboardProps> = ({
  schedule,
  completedActivities,
  markActivityCompleted,
  totalStudyHours,
  cfaTargetHours,
  cfaDeadlineDate,
  points,
  quickHitStreak,
  lastQuickHitDate,
  setActiveSection,
  objectives
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

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickHitReminderCard, setShowQuickHitReminderCard] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentHour = currentTime.getHours();
    const todayStr = currentTime.toISOString().split('T')[0];
    const quickHitScheduleItemDone = completedActivities.includes('home_workout_am');
    
    if (currentHour >= 4 && currentHour < 5 && !quickHitScheduleItemDone) {
      setShowQuickHitReminderCard(true);
      showNotification("Time for your Quick Hit!", {
          body: "It's around 4 AM! Let's get that morning boost.",
          tag: 'quick-hit-reminder-' + todayStr 
      });
    } else {
      setShowQuickHitReminderCard(false);
    }
  }, [currentTime, completedActivities]);


  const getProgressColor = (percentage: number): 'danger' | 'accent' | 'secondary' => {
    if (percentage < 33) return 'danger';
    if (percentage < 66) return 'accent';
    return 'secondary';
  };

  const MotivationalQuote: React.FC = () => {
    const quotes = [
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
      "The journey of a thousand miles begins with a single step. - Lao Tzu",
      "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
      "Believe you can and you're halfway there. - Theodore Roosevelt"
    ];
    const [quote, setQuote] = useState('');
    useEffect(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);
    return <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-4 text-center high-contrast:text-hc-text">"{quote}"</p>;
  };

  const topKRs = useMemo(() => {
    return objectives
      .flatMap(obj => obj.keyResults)
      .filter(kr => kr.currentValue < kr.targetValue) // Only show incomplete KRs
      .sort((a,b) => (a.currentValue/a.targetValue) - (b.currentValue/b.targetValue)) // Sort by percentage complete (ascending)
      .slice(0, 3); // Show top 3 KRs
  }, [objectives]);

  return (
    <div className="space-y-6">
      {showQuickHitReminderCard && (
        <Card className="bg-accent dark:bg-yellow-700 high-contrast:bg-hc-accent high-contrast:text-black">
          <div className="flex items-center justify-center p-2">
            <FireIcon className="w-6 h-6 mr-3" />
            <p className="font-semibold text-lg">It's 4 AM! Time for your Quick-Hit workout!</p>
            <Button size="sm" variant="primary" onClick={() => setActiveSection('quickhit')} className="ml-auto high-contrast:bg-hc-bg high-contrast:text-hc-primary high-contrast:border-hc-primary">
              Go to Quick Hit
            </Button>
          </div>
        </Card>
      )}
      <Card title="Today's Focus" titleIcon={<ClockIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg text-center high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-primary">
            <h4 className="text-lg font-heading text-primary dark:text-blue-300 high-contrast:text-hc-primary">Study Goal</h4>
            <p className="text-2xl font-bold high-contrast:text-hc-text">{totalStudyHours.toFixed(1)} / {cfaTargetHours} hrs</p>
            <ProgressBar value={studyProgressPercent} color={getProgressColor(studyProgressPercent)} showPercentage height="h-2" />
            <p className="text-xs mt-1 high-contrast:text-hc-text">{daysRemaining} days remaining</p>
          </div>
          <div className="bg-secondary/10 dark:bg-secondary/20 p-4 rounded-lg text-center high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-secondary">
            <h4 className="text-lg font-heading text-secondary dark:text-green-300 high-contrast:text-hc-secondary">Points Earned</h4>
            <div className="flex items-center justify-center">
              <TrophyIcon className="w-8 h-8 text-accent high-contrast:text-hc-accent mr-2" />
              <p className="text-3xl font-bold high-contrast:text-hc-text">{points}</p>
            </div>
            <p className="text-xs mt-1 high-contrast:text-hc-text">Keep up the great work!</p>
          </div>
          <div className="bg-accent/10 dark:bg-accent/20 p-4 rounded-lg text-center high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-accent">
            <h4 className="text-lg font-heading text-accent dark:text-yellow-300 high-contrast:text-hc-accent">Quick Hit Streak</h4>
            <div className="flex items-center justify-center">
             <FireIcon className="w-8 h-8 text-red-500 high-contrast:text-hc-accent mr-2" />
             <p className="text-3xl font-bold high-contrast:text-hc-text">{quickHitStreak}</p>
            </div>
             <p className="text-xs mt-1 high-contrast:text-hc-text">days in a row!</p>
          </div>
        </div>
        <MotivationalQuote />
      </Card>

      {topKRs.length > 0 && (
        <Card title="Key Results Focus" titleIcon={<TargetIcon className="text-primary dark:text-blue-400 high-contrast:text-hc-primary"/>}
              actions={<Button variant="ghost" size="sm" onClick={()=>setActiveSection('visionboard')}>View All OKRs</Button>}
        >
          <div className="space-y-3">
            {topKRs.map(kr => (
              <div key={kr.id} className="p-2 bg-light-bg dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium text-light-text dark:text-dark-text high-contrast:text-hc-text">{kr.description}</p>
                <ProgressBar 
                  value={(kr.currentValue / kr.targetValue) * 100} 
                  color={getProgressColor((kr.currentValue / kr.targetValue) * 100)} 
                  showPercentage 
                  height="h-1.5" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 high-contrast:text-gray-300 text-right">{kr.currentValue.toFixed(1)} / {kr.targetValue.toFixed(1)} {kr.unit}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Daily Schedule" titleIcon={<ClockIcon className="text-primary dark:text-blue-400 high-contrast:text-hc-primary"/>}>
        <div className="space-y-3">
          {schedule.map((activity) => (
            <ActivityItem 
              key={activity.id}
              activity={activity}
              isCompleted={completedActivities.includes(activity.id)}
              onToggleComplete={() => markActivityCompleted(activity.id, activity.type === ActivityType.STUDY ? 20 : 10)}
              currentTime={currentTime}
              setActiveSection={setActiveSection}
            />
          ))}
        </div>
      </Card>

      <Card title="Quick Actions" titleIcon={<SparklesIcon className="high-contrast:text-hc-primary" />}>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="primary" onClick={() => setActiveSection('study')} leftIcon={<BookIcon className="w-5 h-5"/>}>Start Study</Button>
            <Button variant="secondary" onClick={() => setActiveSection('gym')} leftIcon={<DumbbellIcon className="w-5 h-5"/>}>Log Workout</Button>
            <Button variant="accent" onClick={() => setActiveSection('meditation')} leftIcon={<MeditationIcon className="w-5 h-5"/>}>Meditate</Button>
            <Button variant="ghost" onClick={() => setActiveSection('quickhit')} leftIcon={<FireIcon className="w-5 h-5"/>}>Quick Hit</Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
