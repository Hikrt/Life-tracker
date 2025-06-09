
import React, { useState, useEffect } from 'react';
import { Theme } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { CogIcon, SunIcon, MoonIcon, ExternalLinkIcon } from '../../constants';

interface SettingsPageProps {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  spotifyPlaylistUrl: string;
  setSpotifyPlaylistUrl: (url: string) => void;
  availableEquipment: string;
  setAvailableEquipment: (equipment: string) => void;
  clearOKRs: () => void; // New prop
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentTheme, 
  setTheme,
  spotifyPlaylistUrl,
  setSpotifyPlaylistUrl,
  availableEquipment,
  setAvailableEquipment,
  clearOKRs
}) => {
  const [fontSize, setFontSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('lifeArchitectFontSize');
    return savedSize ? parseInt(savedSize, 10) : 16; // Default 16px
  });

  const [tempPlaylistUrl, setTempPlaylistUrl] = useState(spotifyPlaylistUrl);
  const [tempEquipment, setTempEquipment] = useState(availableEquipment);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('lifeArchitectFontSize', fontSize.toString());
  }, [fontSize]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 1, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 1, 12));

  const handlePlaylistUrlSave = () => {
    setSpotifyPlaylistUrl(tempPlaylistUrl);
    alert("Spotify Playlist URL saved!");
  };
  
  const handleEquipmentSave = () => {
    setAvailableEquipment(tempEquipment);
    alert("Available equipment saved!");
  };


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card title="App Settings" titleIcon={<CogIcon className="high-contrast:text-hc-primary"/>}>
        {/* Theme Switcher */}
        <div className="mb-6 pb-4 border-b dark:border-gray-700 high-contrast:border-hc-border">
          <h4 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text high-contrast:text-hc-text">Theme</h4>
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleThemeChange('light')} 
              variant={currentTheme === 'light' ? 'primary' : 'ghost'}
              leftIcon={<SunIcon className="w-5 h-5"/>}
            >
              Light
            </Button>
            <Button 
              onClick={() => handleThemeChange('dark')} 
              variant={currentTheme === 'dark' ? 'primary' : 'ghost'}
              leftIcon={<MoonIcon className="w-5 h-5"/>}
            >
              Dark
            </Button>
            <Button 
              onClick={() => handleThemeChange('high-contrast')} 
              variant={currentTheme === 'high-contrast' ? 'primary' : 'ghost'}
              className="border-yellow-400 text-yellow-600 dark:border-yellow-500 dark:text-yellow-400 high-contrast:border-hc-accent high-contrast:text-hc-accent high-contrast:hover:bg-hc-accent high-contrast:hover:text-hc-bg"
            >
              <span className="mr-1">👁️‍🗨️</span> Contrast
            </Button>
          </div>
        </div>

        {/* Font Size Adjuster */}
        <div className="mb-6 pb-4 border-b dark:border-gray-700 high-contrast:border-hc-border">
          <h4 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text high-contrast:text-hc-text">Font Size</h4>
          <div className="flex items-center space-x-3">
            <Button onClick={decreaseFontSize} disabled={fontSize <= 12} variant="ghost">-</Button>
            <span className="text-lg w-10 text-center high-contrast:text-hc-text">{fontSize}px</span>
            <Button onClick={increaseFontSize} disabled={fontSize >= 24} variant="ghost">+</Button>
          </div>
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 high-contrast:text-gray-300">Adjusts the base font size for the app.</p>
        </div>

        {/* Spotify Playlist URL */}
        <div className="mb-6 pb-4 border-b dark:border-gray-700 high-contrast:border-hc-border">
          <h4 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text high-contrast:text-hc-text">Spotify Playlist URL</h4>
          <div className="flex items-end space-x-2">
            <Input 
              type="url"
              id="spotifyUrl"
              value={tempPlaylistUrl}
              onChange={(e) => setTempPlaylistUrl(e.target.value)}
              placeholder="Enter Spotify Playlist URL"
              className="flex-grow"
            />
            <Button onClick={handlePlaylistUrlSave} variant="secondary" size="md">Save</Button>
          </div>
           <a href={spotifyPlaylistUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400 mt-1 inline-flex items-center high-contrast:text-hc-primary high-contrast:hover:text-yellow-300">
              Open Current Playlist <ExternalLinkIcon className="w-3 h-3 ml-1"/>
            </a>
        </div>

        {/* Available Gym Equipment */}
        <div className="mb-6 pb-4 border-b dark:border-gray-700 high-contrast:border-hc-border">
          <h4 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text high-contrast:text-hc-text">Available Gym Equipment</h4>
          <TextArea
            id="gymEquipment"
            value={tempEquipment}
            onChange={(e) => setTempEquipment(e.target.value)}
            placeholder="List your available equipment, e.g., barbells, dumbbells, squat rack, bench press, treadmill..."
            rows={3}
          />
           <Button onClick={handleEquipmentSave} variant="secondary" size="md" className="mt-2">Save Equipment</Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 high-contrast:text-gray-300">
            This helps the AI suggest relevant exercises. Be descriptive.
          </p>
        </div>
                
        <div className="pt-4 space-y-3">
            <div>
                <h4 className="text-md font-semibold mb-1 text-light-text dark:text-dark-text high-contrast:text-hc-text">Clear Quarterly OKRs</h4>
                <Button variant="danger" size="sm" onClick={clearOKRs}>
                    Clear All Objectives & Key Results
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 high-contrast:text-gray-300">Deletes all defined OKRs but keeps other app data.</p>
            </div>
            <div>
                <h4 className="text-md font-semibold mb-1 text-light-text dark:text-dark-text high-contrast:text-hc-text">Full App Reset</h4>
                <Button variant="danger" size="sm" onClick={() => {
                    if(window.confirm("Are you sure you want to clear ALL app data? This includes points, progress, settings, and OKRs. This cannot be undone.")) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}>
                    Clear All Local Data & Reset App
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 high-contrast:text-gray-300">Resets the entire application to its default state.</p>
            </div>
        </div>

      </Card>
    </div>
  );
};

export default SettingsPage;
