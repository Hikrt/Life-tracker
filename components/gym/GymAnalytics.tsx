
import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChartBarIcon } from '../../constants';
import { WorkoutLog, CardioLog, GymDayType, Theme } from '../../types'; // Added Theme
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface GymAnalyticsProps {
  onBack: () => void;
  workoutLogs: WorkoutLog[]; 
  cardioLogs: CardioLog[];
  theme: Theme; // Added theme prop
}

interface WeeklyVolumeData {
  week: string;
  Push?: number;
  Pull?: number;
  Legs?: number;
  Other?: number; 
  [key: string]: string | number | undefined; 
}

interface WeeklyCardioData {
  week: string;
  duration: number;
  calories?: number;
  distance?: number;
}

const getWeekNumber = (dateStr: string): number => {
  const date = new Date(dateStr);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};


const GymAnalytics: React.FC<GymAnalyticsProps> = ({ onBack, workoutLogs, cardioLogs, theme }) => {

  const chartTextColor = theme === 'light' ? '#1F2937' : theme === 'dark' ? '#F3F4F6' : '#FFFFFF';
  const chartGridColor = theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#4A5568';
  const chartTooltipBg = theme === 'light' ? '#FFFFFF' : theme === 'dark' ? '#1F2937' : '#000000';
  const chartTooltipBorder = theme === 'light' ? '#E5E7EB' : theme === 'dark' ? '#374151' : '#FFFFFF';


  const weeklyVolumeChartData = useMemo(() => {
    const aggregated: { [week: string]: WeeklyVolumeData } = {};
    workoutLogs.forEach(log => {
      const week = `Week ${getWeekNumber(log.date)}`;
      if (!aggregated[week]) {
        aggregated[week] = { week, Push: 0, Pull: 0, Legs: 0, Other: 0 };
      }
      const volume = (log.reps * log.weight * (log.sets || 1));
      let categoryKey: 'Push' | 'Pull' | 'Legs' | 'Other' = 'Other';

      if (log.dayType === GymDayType.PUSH || log.muscleGroup?.toLowerCase().includes('chest') || log.muscleGroup?.toLowerCase().includes('shoulder') || log.muscleGroup?.toLowerCase().includes('tricep')) {
        categoryKey = 'Push';
      } else if (log.dayType === GymDayType.PULL || log.muscleGroup?.toLowerCase().includes('back') || log.muscleGroup?.toLowerCase().includes('bicep')) {
        categoryKey = 'Pull';
      } else if (log.dayType === GymDayType.LEGS || log.muscleGroup?.toLowerCase().includes('quad') || log.muscleGroup?.toLowerCase().includes('hamstring') || log.muscleGroup?.toLowerCase().includes('glute')) {
        categoryKey = 'Legs';
      }
      
      aggregated[week][categoryKey] = (aggregated[week][categoryKey] || 0) as number + volume;
    });
    return Object.values(aggregated)
        .filter(d => d.Push || d.Pull || d.Legs || d.Other) // Ensure there's some volume
        .sort((a,b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
  }, [workoutLogs]);

  const weeklyCardioChartData = useMemo(() => {
    const aggregated: { [week: string]: WeeklyCardioData } = {};
    cardioLogs.forEach(log => {
      const week = `Week ${getWeekNumber(log.date)}`;
      if (!aggregated[week]) {
        aggregated[week] = { week, duration: 0, calories: 0, distance: 0 };
      }
      aggregated[week].duration += log.durationMinutes;
      aggregated[week].calories = (aggregated[week].calories || 0) + (log.caloriesBurned || 0);
      aggregated[week].distance = (aggregated[week].distance || 0) + (log.distanceKm || 0);
    });
     return Object.values(aggregated)
        .filter(d => d.duration > 0) // Ensure there's some duration
        .sort((a,b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
  }, [cardioLogs]);

  const volumeLineColors = theme === 'high-contrast'
    ? ['#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF'] // HC Primary, Secondary, Accent, White
    : ['#1E88E5', '#43A047', '#FDD835', '#EF4444']; // Blue, Green, Yellow, Red

  const cardioBarColor = theme === 'high-contrast' ? '#00FFFF' : '#43A047'; // HC Secondary or Green
  const cardioLineColor = theme === 'high-contrast' ? '#FFFF00' : '#1E88E5'; // HC Primary or Blue


  return (
    <div className="space-y-6">
      <Card title="Workout Analytics" titleIcon={<ChartBarIcon className="high-contrast:text-hc-primary" />} actions={<Button variant="ghost" onClick={onBack}>Back to Gym</Button>}>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 high-contrast:text-gray-300">
          Track your progress over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Weekly Volume (kg) by Day Type">
            <div className="h-72 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center rounded p-2 high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-border">
              {weeklyVolumeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyVolumeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="week" stroke={chartTextColor} tick={{fontSize: 10}} />
                    <YAxis stroke={chartTextColor} label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 12 }}/>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}} 
                        itemStyle={{ color: chartTextColor }}
                        labelStyle={{ color: chartTextColor }}
                        wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                    />
                    <Legend wrapperStyle={{ color: chartTextColor, fontSize: 10 }} />
                    {['Push', 'Pull', 'Legs', 'Other'].map((key, index) => (
                        weeklyVolumeChartData.some(d => d[key] && (d[key] as number) > 0) && // Only render line if data exists
                         <Line key={key} type="monotone" dataKey={key} stroke={volumeLineColors[index % volumeLineColors.length]} activeDot={{ r: 6 }} name={key} />
                    ))}
                  </LineChart>
                </ResponsiveContainer> 
              ) : (
                <p className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10">Log workouts to see volume data.</p>
              )}
            </div>
          </Card>

          <Card title="Weekly Cardio Progress">
             <div className="h-72 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center rounded p-2 high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-border">
              {weeklyCardioChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCardioChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="week" stroke={chartTextColor} tick={{fontSize: 10}} />
                    <YAxis yAxisId="left" orientation="left" stroke={cardioBarColor} label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft', fill: cardioBarColor, fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke={cardioLineColor} label={{ value: 'Distance (km)', angle: 90, position: 'insideRight', fill: cardioLineColor, fontSize: 12 }}/>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}}
                        itemStyle={{ color: chartTextColor }}
                        labelStyle={{ color: chartTextColor }}
                        wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                    />
                    <Legend wrapperStyle={{ color: chartTextColor, fontSize: 10 }}/>
                    <Bar yAxisId="left" dataKey="duration" fill={cardioBarColor} name="Duration (min)" />
                    {weeklyCardioChartData.some(d => d.distance && d.distance > 0) && 
                        <Line yAxisId="right" type="monotone" dataKey="distance" stroke={cardioLineColor} name="Distance (km)" />
                    }
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10">Log cardio sessions to see progress.</p>
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default GymAnalytics;
