'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Calendar, List, Filter, Flame, Droplets, ShieldAlert, Rocket } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Launch {
  id: string;
  tokenName: string;
  ticker: string;
  launchDate: string;
  hypeScore: number;
  whaleInterest: number;
  expectedLiquiditySol: number;
  riskRating: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'live' | 'completed';
  creatorWallet: string;
}

export default function LaunchCalendarPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  const borderClass = `border-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'}`;
  const textClass = isDark ? 'text-white' : 'text-black';
  const bgClass = isDark ? 'bg-[#050510]' : 'bg-white';
  const shadowClass = isDark ? 'shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]' : 'shadow-[4px_4px_0px_0px_#000]';

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const res = await fetch('/api/launch-calendar');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setLaunches(data.launches);
      } catch (error) {
        showToast('Error loading calendar data', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLaunches();
  }, [showToast]);

  const filteredLaunches = launches.filter(launch => {
    if (filter === 'all') return true;
    const launchDate = new Date(launch.launchDate);
    const now = new Date();
    if (filter === 'week') {
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      return launchDate >= now && launchDate <= nextWeek;
    }
    if (filter === 'month') {
      return launchDate.getMonth() === now.getMonth() && launchDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-[#10B981]'; // green
      case 'medium': return 'bg-[#F59E0B]'; // yellow/gold
      case 'high': return 'bg-[#F43F5E]'; // red
      default: return 'bg-gray-500';
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-[#10B981]';
      case 'medium': return 'text-[#F59E0B]';
      case 'high': return 'text-[#F43F5E]';
      default: return 'text-gray-500';
    }
  };

  const renderCalendarGrid = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const days = [];
    const emptyDays = firstDay.getDay();
    
    // Fill empty slots before first day
    for (let i = 0; i < emptyDays; i++) {
      days.push(<div key={`empty-${i}`} className={`p-4 opacity-10 ${borderClass} border-t-0 border-l-0`}></div>);
    }
    
    // Fill days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const currentCellDate = new Date(currentYear, currentMonth, d);
      const dayLaunches = filteredLaunches.filter(l => {
        const lDate = new Date(l.launchDate);
        return lDate.getDate() === d && lDate.getMonth() === currentMonth && lDate.getFullYear() === currentYear;
      });

      const isToday = currentCellDate.getDate() === today.getDate() && currentCellDate.getMonth() === today.getMonth();

      days.push(
        <div key={d} className={`p-2 min-h-[100px] flex flex-col ${borderClass} border-t-0 border-l-0 ${isToday ? (isDark ? 'bg-[rgba(99,102,241,0.2)]' : 'bg-[#6366F1]/10') : ''}`}>
          <span className={`text-sm font-bold ${textClass}`}>{d}</span>
          <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto">
            {dayLaunches.map(launch => (
              <div key={launch.id} className={`text-xs p-1 px-2 flex items-center gap-1 ${borderClass} bg-black/5 dark:bg-white/5`}>
                <div className={`w-2 h-2 rounded-full ${getRiskColor(launch.riskRating)}`} />
                <span className={`font-mono truncate ${textClass}`}>{launch.ticker}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={`${borderClass} ${shadowClass} bg-transparent mt-6`}>
        <div className={`grid grid-cols-7 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'}`}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={day} className={`p-2 text-center font-bold text-sm ${textClass} ${i > 0 ? `border-l-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'}` : ''}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l-2 border-t-2 border-transparent">
          {days}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="flex flex-col gap-4 mt-6">
        {filteredLaunches.map(launch => (
          <motion.div
            key={launch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 ${borderClass} ${shadowClass} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${bgClass}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg ${borderClass} ${bgClass} ${textClass}`}>
                {launch.ticker.substring(0, 2)}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${textClass}`}>{launch.tokenName} <span className="text-gray-400 text-sm">${launch.ticker}</span></h3>
                <p className={`text-sm text-gray-500`}>{new Date(launch.launchDate).toLocaleDateString()} • {new Date(launch.launchDate).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-4 justify-around">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><Flame size={12}/> Hype</span>
                <div className="flex items-center gap-2">
                  <div className={`w-24 h-2 ${borderClass} bg-gray-200 dark:bg-gray-800`}>
                    <div className="h-full bg-[#F59E0B]" style={{ width: `${launch.hypeScore}%` }} />
                  </div>
                  <span className={`text-sm font-bold ${textClass}`}>{launch.hypeScore}</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><Droplets size={12}/> Liquidity</span>
                <span className={`text-sm font-bold ${textClass}`}>{launch.expectedLiquiditySol} SOL</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><ShieldAlert size={12}/> Risk</span>
                <span className={`text-sm font-bold uppercase ${getRiskTextColor(launch.riskRating)}`}>{launch.riskRating}</span>
              </div>
            </div>
            
            <div>
               <button className={`px-4 py-2 uppercase font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${borderClass} ${shadowClass} ${bgClass} ${textClass}`}>
                  View Details
               </button>
            </div>
          </motion.div>
        ))}
        {filteredLaunches.length === 0 && (
          <div className={`p-8 text-center font-mono ${textClass}`}>No launches found for selected filter.</div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-8 font-mono ${isDark ? 'bg-[#050510]' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className={`text-4xl md:text-5xl font-black mb-2 uppercase tracking-wider ${textClass}`}>[ LAUNCH CALENDAR ]</h1>
          <p className="text-[#0EA5E9] font-bold text-lg uppercase tracking-wide">Know Before Everyone Else.</p>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-bold uppercase ${borderClass} ${filter === 'all' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : `${bgClass} ${textClass}`}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-3 py-1 text-sm font-bold uppercase ${borderClass} ${filter === 'week' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : `${bgClass} ${textClass}`}`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`px-3 py-1 text-sm font-bold uppercase ${borderClass} ${filter === 'month' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : `${bgClass} ${textClass}`}`}
            >
              This Month
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 ${borderClass} ${viewMode === 'calendar' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : `${bgClass} ${textClass}`}`}
              title="Calendar View"
            >
              <Calendar size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${borderClass} ${viewMode === 'list' ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : `${bgClass} ${textClass}`}`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`p-12 text-center font-bold text-xl animate-pulse ${textClass}`}>LOADING ORACLE DATA...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'calendar' ? renderCalendarGrid() : renderListView()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
