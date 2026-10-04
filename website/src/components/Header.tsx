import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Bell,
  MapPin,
  ChevronDown,
  Activity,
  AlertTriangle,
  Map,
  Network,
  LayoutDashboard,
  BarChart3,
  History,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Cpu,
} from 'lucide-react';
import { LocationConfig, LocationId } from '../types';
import { LOCATIONS } from '../data/locations';
import { NavTabId } from './Navigation';
import { useTheme } from '../context/ThemeContext';
import GooeyNav from './GooeyNav';

interface HeaderProps {
  currentLocation: LocationConfig;
  onSelectLocation: (id: LocationId) => void;
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  unacknowledgedAlertsCount: number;
  isSimulating: boolean;
  onToggleSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  activeTab,
  onTabChange,
  unacknowledgedAlertsCount,
  isSimulating,
  onToggleSimulate,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabs = [
    { id: 'overview' as NavTabId, label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring' as NavTabId, label: 'Live Monitoring', icon: Activity },
    {
      id: 'risk' as NavTabId,
      label: 'Risk Intelligence',
      icon: AlertTriangle,
      tag: currentLocation.liveMetrics.compositeRiskLevel,
    },
    { id: 'topology' as NavTabId, label: 'Network Topology', icon: Network },
    {
      id: 'alerts' as NavTabId,
      label: 'Alerts',
      icon: Bell,
      badge: unacknowledgedAlertsCount > 0 ? String(unacknowledgedAlertsCount).padStart(2, '0') : undefined,
    },
    { id: 'analytics' as NavTabId, label: 'Analytics', icon: BarChart3 },
    { id: 'pcb' as NavTabId, label: 'PCB', icon: Cpu },
  ];

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  useEffect(() => {
    const activeEl = document.getElementById(`nav-tab-${activeTab}`);
    if (activeEl && navRef.current) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    setTimeout(checkScroll, 200);
  }, [activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 260;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 250);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      navRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const activeTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];
  const ActiveTabIcon = activeTabObj.icon;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors backdrop-blur-md border-b ${
        isDarkMode
          ? 'bg-black/20 text-white border-white/10'
          : 'bg-white/20 text-slate-900 border-black/10'
      }`}
    >
      {/* UNIFIED SINGLE-ROW DASHBOARD NAVIGATION BAR */}
      <div className="max-w-[1750px] mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* LEFT: Brand Logo + ENVORA Title + Location Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Pulsing signal icon */}
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                isDarkMode
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 backdrop-blur-sm'
                  : 'bg-teal-700/85 text-white shadow-xs backdrop-blur-sm'
              }`}
              onClick={() => onTabChange('overview')}
              title="ENVORA Home"
            >
              <Radio className="w-5 h-5 animate-pulse" />
            </div>

            {/* Brand Title: ENVORA */}
            <div
              onClick={() => onTabChange('overview')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <span
                className={`font-black text-lg sm:text-xl tracking-wider uppercase ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                ENVORA
              </span>
            </div>

            {/* Location Switcher Pill */}
            <div className="relative">
              <button
                id="header-location-pill"
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-black/40 hover:bg-black/60 text-cyan-300 border-white/15 hover:border-cyan-400'
                    : 'bg-white/40 hover:bg-white/60 text-slate-800 border-black/15 hover:border-teal-600'
                }`}
              >
                <MapPin className="w-3 h-3 text-cyan-500" />
                <span>{currentLocation.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Location Dropdown menu */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div
                    className={`absolute left-0 mt-2 w-64 rounded-xl border shadow-2xl py-1.5 z-50 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 border-b border-current/10">
                      Select Region
                    </div>
                    {Object.values(LOCATIONS).map((loc) => {
                      const isSelected = loc.id === currentLocation.id;
                      return (
                        <button
                          key={loc.id}
                          id={`select-loc-${loc.id}`}
                          onClick={() => {
                            onSelectLocation(loc.id as LocationId);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? isDarkMode
                                ? 'bg-cyan-950/80 text-cyan-300 font-bold'
                                : 'bg-teal-50 text-teal-900 font-bold'
                              : 'hover:bg-slate-800/40 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div>
                            <span className="font-bold">{loc.name}</span>
                            <span className="text-[10px] opacity-60 ml-1">
                              ({loc.stateOrUt})
                            </span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              loc.liveMetrics.compositeRiskLevel === 'Critical'
                                ? 'bg-red-900/60 text-red-300'
                                : loc.liveMetrics.compositeRiskLevel === 'High'
                                ? 'bg-amber-900/60 text-amber-300'
                                : 'bg-emerald-900/60 text-emerald-300'
                            }`}
                          >
                            {loc.liveMetrics.compositeRiskLevel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CENTER: Combined Dashboard Navigation Tabs with GooeyNav */}
          <div className="flex-1 min-w-0 mx-1 sm:mx-3 relative flex items-center">
            {/* Left Arrow button for smooth scrolling */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className={`hidden md:flex items-center justify-center absolute left-0 z-20 w-6 h-6 rounded-full border shadow-md transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 text-[#2dd4bf] border-[#007D73] hover:bg-[#007D73]/20'
                    : 'bg-white text-[#007D73] border-[#007D73]/50 hover:bg-[#007D73]/10'
                }`}
                title="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Navigation Tabs */}
            <div className="flex-1 overflow-hidden">
              <GooeyNav
                items={tabs}
                activeIndex={tabs.findIndex((t) => t.id === activeTab) >= 0 ? tabs.findIndex((t) => t.id === activeTab) : 0}
                onTabChange={(_index, item) => onTabChange(item.id as NavTabId)}
                onScroll={checkScroll}
                onWheel={handleWheel}
                scrollRef={navRef}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Right Arrow button for smooth scrolling */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className={`hidden md:flex items-center justify-center absolute right-0 z-20 w-6 h-6 rounded-full border shadow-md transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 text-[#2dd4bf] border-[#007D73] hover:bg-[#007D73]/20'
                    : 'bg-white text-[#007D73] border-[#007D73]/50 hover:bg-[#007D73]/10'
                }`}
                title="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* RIGHT: Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm ${
                isDarkMode
                  ? 'bg-black/40 hover:bg-black/60 text-amber-300 border-white/15'
                  : 'bg-white/40 hover:bg-white/60 text-amber-600 border-black/15 shadow-xs'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Quick Dropdown Jump Menu for instant 1-tap view switching on very small screens */}
            <div className="md:hidden relative">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-1.5 rounded-md border text-xs font-bold flex items-center gap-1 backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-black/40 text-[#2dd4bf] border-white/15'
                    : 'bg-white/40 text-[#007D73] border-black/15'
                }`}
                title="All views menu"
              >
                <ActiveTabIcon className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {isMobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl py-1.5 z-50 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 border-b border-current/10">
                      Jump to Dashboard View
                    </div>
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            onTabChange(tab.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                            isActive
                              ? isDarkMode
                                ? 'bg-[#007D73]/30 text-[#2dd4bf] font-bold border-l-2 border-[#007D73]'
                                : 'bg-[#007D73]/15 text-[#00695f] font-bold border-l-2 border-[#007D73]'
                              : 'hover:bg-slate-800/40 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                          </div>
                          {tab.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-600 text-white">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

