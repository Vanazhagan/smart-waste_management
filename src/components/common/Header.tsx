import React, { useState } from 'react';
import {
  Bell,
  Languages,
  User,
  Shield,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { translations } from '../../translations';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    runEndToEndDemo,
    isDemoRunning,
    demoStepMessage,
    resetToSeedData,
    setActiveView,
  } = useStore();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const t = translations[language];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top emergency / demo banner when demo is active */}
      {isDemoRunning && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-2 text-xs md:text-sm font-medium text-white flex items-center justify-between shadow-inner animate-pulse">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <Sparkles className="w-4 h-4 shrink-0 text-yellow-300" />
            <span className="font-bold tracking-wide uppercase">AI Hackathon Demo Active:</span>
            <span className="truncate">{demoStepMessage}</span>
          </div>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono">Running Simulation...</span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Crest */}
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              {/* Civic Crest Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
                <Shield className="w-6 h-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                    {language === 'ta' ? 'தமிழ்நாடு நகராட்சி' : 'Tamil Nadu Municipal'}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Smart Waste
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                  {language === 'ta' ? 'ஸ்மார்ட் கழிவு மேலாண்மை' : 'Smart Waste Management Platform'}
                  <span className="hidden lg:inline text-slate-400 ml-1.5">• {t.appSubtitle}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick 1-Click End-to-End Demo Scenario Button */}
            <button
              type="button"
              onClick={() => runEndToEndDemo()}
              disabled={isDemoRunning}
              title="Run 8-step live scenario: Citizen complaint -> AI Priority -> Worker dispatch -> AI photo verification -> Feedback"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
                isDemoRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95 ring-1 ring-emerald-400/40'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDemoRunning ? 'Running Demo...' : 'Run Live Demo Scenario'}</span>
            </button>

            {/* Reset Data Button */}
            <button
              type="button"
              onClick={resetToSeedData}
              title="Reset sample municipal dataset"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Language Switcher (EN | தமிழ்) */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              title="Switch Language (English / தமிழ்)"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Municipal Alerts</span>
                      <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">No active alerts currently.</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.type === 'complaint') setActiveView('complaints');
                            if (n.type === 'smartbin') setActiveView('smartDustbins');
                            if (n.type === 'hotspot') setActiveView('hotspots');
                            setShowNotifs(false);
                          }}
                          className={`p-3.5 text-xs hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.severity === 'Critical' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                            ) : n.severity === 'High' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-slate-900 ${!n.read ? 'text-emerald-950 font-bold' : ''}`}>
                              {n.title}
                            </p>
                            <p className="text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition"
              >
                <div
                  className={`w-2 h-2 rounded-full ${role === 'ADMIN' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
                />
                <span className="font-semibold text-slate-200">
                  {role === 'ADMIN' ? (language === 'ta' ? 'நிர்வாகம்' : 'Admin') : language === 'ta' ? 'குடிமக்கள்' : 'Citizen'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 p-2 text-xs">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.switchRole}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('CITIZEN');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                      role === 'CITIZEN' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>{t.citizen}</span>
                    </div>
                    {role === 'CITIZEN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('ADMIN');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between mt-1 ${
                      role === 'ADMIN' ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-800" />
                      <span>{t.admin}</span>
                    </div>
                    {role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-slate-800" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
