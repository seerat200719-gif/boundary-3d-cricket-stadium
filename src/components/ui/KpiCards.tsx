import React from 'react';
import { Users, Clock, Trophy, TrendingUp, AlertTriangle, ArrowUpRight, Flame } from 'lucide-react';
import { CricketMatchState } from '../../types/stadium';

interface KpiCardsProps {
  matchState: CricketMatchState;
  attendanceCount: number;
  capacityMax: number;
  averageWaitTimeMin: number;
  onFocusGate: () => void;
  onFocusPitch: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  matchState,
  attendanceCount,
  capacityMax,
  averageWaitTimeMin,
  onFocusGate,
  onFocusPitch,
}) => {
  const attendancePct = ((attendanceCount / capacityMax) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pointer-events-auto">
      {/* 1. ATTENDANCE KPI */}
      <div className="bg-white/95 rounded-xl p-3.5 border border-slate-200/90 shadow-sm text-slate-900 transition hover:border-blue-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#1E5EFF]" />
            Live Attendance
          </div>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1E5EFF]">
            {attendancePct}% FULL
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1.5">
          <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {attendanceCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            / {capacityMax.toLocaleString()} Cap
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-[#1E5EFF] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${attendancePct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            +340 fans/min
          </span>
          <span className="text-slate-400">Peak: East Gate</span>
        </div>
      </div>

      {/* 2. GATE WAIT TIME KPI */}
      <div
        onClick={onFocusGate}
        className="cursor-pointer bg-white/95 rounded-xl p-3.5 border border-slate-200/90 shadow-sm text-slate-900 transition hover:border-blue-300 group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Avg Turnstile Wait
          </div>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
            OPTIMAL
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1.5">
          <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {averageWaitTimeMin.toFixed(1)}{' '}
            <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
            -1.8m vs Peak
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (averageWaitTimeMin / 10) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>34 / 38 Turnstiles Active</span>
          <span className="group-hover:text-[#1E5EFF] font-medium transition">
            Inspect Gates →
          </span>
        </div>
      </div>

      {/* 3. LIVE SCORE KPI */}
      <div
        onClick={onFocusPitch}
        className="cursor-pointer bg-white/95 rounded-xl p-3.5 border border-slate-200/90 shadow-sm text-slate-900 transition hover:border-blue-300 group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-[#1E5EFF]" />
            Match Center
          </div>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1E5EFF]">
            CHASE PHASE
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1">
          <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {matchState.battingTeam}{' '}
            <span className="text-[#1E5EFF]">{matchState.runs}/{matchState.wickets}</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-600">
            {matchState.overs}.{matchState.ballsInOver} / 20 ov
          </div>
        </div>

        {/* Batters quick read */}
        <div className="flex items-center justify-between text-[11px] text-slate-700 font-medium mb-1.5">
          <span>
            {matchState.batter1.name}:{' '}
            <strong className="text-slate-900">{matchState.batter1.runs}*</strong> ({matchState.batter1.balls}b)
          </span>
          <span className="text-slate-500">
            CRR: {matchState.currentRunRate} | Req: {matchState.requiredRunRate}
          </span>
        </div>

        {/* Last Action ticker */}
        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="truncate">{matchState.lastAction}</span>
        </div>
      </div>
    </div>
  );
};
