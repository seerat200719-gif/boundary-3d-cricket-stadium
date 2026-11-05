import React, { useState } from 'react';
import {
  Shield,
  Search,
  CloudSun,
  Sun,
  CloudRain,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  Maximize2,
  Eye,
  EyeOff,
  Radio,
  Clock
} from 'lucide-react';
import { CameraArea, OperationalAlert, WeatherType } from '../../types/stadium';
import { audioEngine } from '../AudioEngine';

interface TopNavProps {
  weather: WeatherType;
  onWeatherChange: (w: WeatherType) => void;
  activeArea: CameraArea;
  onAreaChange: (a: CameraArea) => void;
  alerts: OperationalAlert[];
  onOpenAlerts: () => void;
  isCinemaMode: boolean;
  onToggleCinemaMode: () => void;
  simulatedTime: string;
  onOpenCharacterStudio: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  weather,
  onWeatherChange,
  activeArea,
  onAreaChange,
  alerts,
  onOpenAlerts,
  isCinemaMode,
  onToggleCinemaMode,
  simulatedTime,
  onOpenCharacterStudio,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showWeatherMenu, setShowWeatherMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const weatherOptions: { id: WeatherType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'clear', label: 'Clear Day', icon: <Sun className="w-4 h-4 text-amber-500" />, desc: 'Bright daylight & crisp shadows' },
    { id: 'dew', label: 'Evening Dew', icon: <CloudSun className="w-4 h-4 text-orange-500" />, desc: 'Golden hour amber twilight' },
    { id: 'rain', label: 'Rain Delay', icon: <CloudRain className="w-4 h-4 text-blue-500" />, desc: 'Pitch covers roll onto field' },
    { id: 'night', label: 'Dusk / Night', icon: <Moon className="w-4 h-4 text-indigo-400" />, desc: 'Sequential 4-tower floodlights' },
  ];

  const areaOptions: { id: CameraArea; label: string }[] = [
    { id: 'all', label: 'Overview' },
    { id: 'field', label: 'Field' },
    { id: 'stands', label: 'Stands' },
    { id: 'gates', label: 'Gates' },
    { id: 'parking', label: 'Parking' },
    { id: 'metro', label: 'Metro' },
  ];

  const unreadAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <header className="relative z-30 flex items-center justify-between px-3 md:px-5 py-2.5 bg-white/90 border-b border-slate-200/90 text-slate-900 shadow-sm transition-all duration-300">
      {/* Brand & Live Ops Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1E5EFF] flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tighter">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                BOUNDARY
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Radio className="w-2.5 h-2.5 text-emerald-600" />
                LIVE MATCH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Cricket Stadium Command & Ops Center
            </p>
          </div>
        </div>

        {/* Live Match Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{simulatedTime} IST</span>
          <span className="text-slate-400">|</span>
          <span className="text-[#1E5EFF] font-semibold">T20 FINAL</span>
        </div>
      </div>

      {/* Center: Area Switcher */}
      <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
        {areaOptions.map((area) => (
          <button
            key={area.id}
            onClick={() => onAreaChange(area.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeArea === area.id
                ? 'bg-white text-[#1E5EFF] font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Right Controls: Weather, Sound, Alerts, Zen Mode, Profile */}
      <div className="flex items-center gap-2">
        {/* Weather Picker */}
        <div className="relative">
          <button
            onClick={() => setShowWeatherMenu(!showWeatherMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-medium text-slate-700 transition"
            title="Stadium Atmosphere & Lighting"
          >
            {weather === 'clear' && <Sun className="w-4 h-4 text-amber-500" />}
            {weather === 'dew' && <CloudSun className="w-4 h-4 text-orange-500" />}
            {weather === 'rain' && <CloudRain className="w-4 h-4 text-blue-500" />}
            {weather === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
            <span className="capitalize hidden sm:inline">{weather}</span>
          </button>

          {showWeatherMenu && (
            <div className="absolute right-0 mt-1.5 w-60 p-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Stadium Lighting & Weather
              </div>
              {weatherOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onWeatherChange(opt.id);
                    setShowWeatherMenu(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition ${
                    weather === opt.id ? 'bg-blue-50 text-[#1E5EFF]' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg border transition ${
            isMuted
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : 'bg-blue-50 text-[#1E5EFF] border-blue-200'
          }`}
          title={isMuted ? 'Unmute Stadium Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Operations Alerts Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-700 transition"
          title="Match Day Operations Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>

        {/* Character Studio Button */}
        <button
          onClick={onOpenCharacterStudio}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition shadow-xs"
          title="Open 3D Character Studio & Avatar Customizer"
        >
          <span className="text-sm">🌸</span>
          <span className="hidden sm:inline">Character 3D</span>
        </button>

        {/* Zen / Cinema Mode Toggle */}
        <button
          onClick={onToggleCinemaMode}
          className={`p-2 rounded-lg border transition hidden sm:flex items-center justify-center ${
            isCinemaMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title={isCinemaMode ? 'Exit Cinema View (H)' : 'Enter Cinema View (H)'}
        >
          {isCinemaMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Pixar User Avatar & Ops Director */}
        <button
          onClick={onOpenCharacterStudio}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition group text-left"
          title="Click to view & customize 3D Pixar Avatar"
        >
          <div className="relative">
            <img
              src="/assets/aistudio/image_fc2286fe.png"
              alt="Leo Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-pink-300 group-hover:border-pink-500 shadow-xs transition"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              Leo
              <span className="text-[9px] font-semibold text-pink-600 bg-pink-50 px-1 rounded">3D</span>
            </div>
            <div className="text-[10px] text-slate-500">Ops Director & Batter</div>
          </div>
        </button>
      </div>
    </header>
  );
};
