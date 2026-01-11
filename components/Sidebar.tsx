
import React, { memo } from 'react';
import { Camera, Film, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: 'photos' | 'videos' | 'admin';
  onViewChange: (view: 'photos' | 'videos' | 'admin') => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ currentView, onViewChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <Film className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold text-white">My Gallery</span>
      </div>

      <nav className="flex gap-2">
        <button
          onClick={() => onViewChange('videos')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            currentView === 'videos' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" />
          Videos
        </button>
        <button
          onClick={() => onViewChange('photos')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            currentView === 'photos' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Camera className="w-4 h-4" />
          Photos
        </button>
        <button
          onClick={() => onViewChange('admin')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            currentView === 'admin' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          Admin
        </button>
      </nav>
    </header>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
