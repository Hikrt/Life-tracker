
import React from 'react';
import { ActiveSection, SetActiveSection } from '../../types';
import { BookIcon, CogIcon, DumbbellIcon, MeditationIcon, SparklesIcon, TrophyIcon, FireIcon, ChartBarIcon, PlateIcon, TargetIcon, TrendingUpIcon } from '../../constants';

interface HeaderProps {
  appName: string;
  onNavigate: SetActiveSection;
  currentPoints: number;
  currentSection: ActiveSection;
}

const NavItem: React.FC<{
  label: string;
  section: ActiveSection;
  icon: React.ReactNode;
  currentSection: ActiveSection;
  onClick: SetActiveSection;
}> = ({ label, section, icon, currentSection, onClick }) => (
  <button
    onClick={() => onClick(section)}
    className={`flex flex-col items-center px-1 sm:px-2 py-1 rounded-lg transition-all duration-150 
                ${currentSection === section 
                  ? 'text-primary dark:text-accent scale-110 high-contrast:text-hc-accent font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent high-contrast:text-hc-text high-contrast:hover:text-hc-accent'}`}
    aria-label={`Navigate to ${label}`}
  >
    {icon}
    <span className="text-xs mt-0.5 hidden sm:inline">{label}</span>
  </button>
);


const Header: React.FC<HeaderProps> = ({ appName, onNavigate, currentPoints, currentSection }) => {
  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-40 transition-colors duration-300 high-contrast:bg-hc-card high-contrast:border-b high-contrast:border-hc-border">
      <div className="container mx-auto px-1 sm:px-4 py-2 flex justify-between items-center">
        <h1 onClick={() => onNavigate('dashboard')} className="text-lg sm:text-2xl font-heading text-primary dark:text-blue-400 cursor-pointer hover:opacity-80 transition-opacity high-contrast:text-hc-primary">
          {appName}
        </h1>
        
        <nav className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5">
          <NavItem label="Home" section="dashboard" icon={<TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Vision" section="visionboard" icon={<TargetIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Quick Hit" section="quickhit" icon={<FireIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Study" section="study" icon={<BookIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Gym" section="gym" icon={<DumbbellIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Nutrition" section="nutrition" icon={<PlateIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Meditate" section="meditation" icon={<MeditationIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="AI Coach" section="voiceqa" icon={<SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Stats" section="analytics" icon={<ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
          <NavItem label="Visuals" section="visuals" icon={<TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />} currentSection={currentSection} onClick={onNavigate} />
        </nav>

        <div className="flex items-center space-x-1 sm:space-x-3">
          <div className="flex items-center text-xs sm:text-base">
            <TrophyIcon className="w-3 h-3 sm:w-5 sm:h-5 text-accent high-contrast:text-hc-accent mr-0.5 sm:mr-1" />
            <span className="font-medium text-light-text dark:text-dark-text high-contrast:text-hc-text">{currentPoints}</span>
          </div>
          <button onClick={() => onNavigate('settings')} className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent high-contrast:text-hc-text high-contrast:hover:text-hc-accent" aria-label="Settings">
            <CogIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
