
import React from 'react';
import { Home, Compass, Trophy, Users } from 'lucide-react';
import { ScreenName } from '../types';
import { playSound } from '../App';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  userAvatar: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, userAvatar }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'trophy-case', icon: Trophy, label: 'Trophies' },
    { id: 'community', icon: Users, label: 'Community' },
  ];

  const isProfileActive = currentScreen === 'profile-settings';

  const handleNavigate = (screen: ScreenName) => {
      playSound('tap');
      onNavigate(screen);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-2 max-w-md mx-auto pointer-events-none">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-[28px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] px-6 py-4 flex justify-between items-center pointer-events-auto ring-1 ring-black/5">
        {navItems.map((item) => {
          const isActive = item.id === currentScreen || 
                          (item.id === 'home' && currentScreen === 'profile') ||
                          (item.id === 'trophy-case' && currentScreen === 'portfolio'); // Handle legacy name map if needed
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id as ScreenName)}
              className="relative flex flex-col items-center justify-center gap-1 group w-12 h-12"
            >
              <div className={`transition-all duration-300 relative z-10 ${isActive ? 'text-orange-500 scale-105' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <div className="absolute inset-0 bg-orange-500/10 rounded-xl blur-md scale-125 z-0" />
              )}
            </button>
          );
        })}
        
        {/* Profile Avatar Button */}
        <button
            onClick={() => handleNavigate('profile-settings')}
            className={`relative flex flex-col items-center justify-center gap-1 group w-12 h-12 transition-all duration-300`}
        >
            <div className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all shadow-sm ${isProfileActive ? 'border-orange-500 scale-110 ring-2 ring-orange-200' : 'border-transparent'}`}>
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
             {isProfileActive && (
                <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-md scale-125 z-0" />
              )}
        </button>
      </div>
    </div>
  );
};
