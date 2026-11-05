import React from 'react';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react';

export interface MatchMilestone {
  id: string;
  label: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming';
  desc: string;
}

interface MatchMilestoneTrackerProps {
  milestones: MatchMilestone[];
  onSelectMilestone: (id: string) => void;
}

export const MatchMilestoneTracker: React.FC<MatchMilestoneTrackerProps> = ({
  milestones,
  onSelectMilestone,
}) => {
  return (
    <div className="bg-white/95 rounded-xl p-3 border border-slate-200/90 shadow-sm text-slate-900 pointer-events-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-[#1E5EFF]" />
          Match Day Timeline
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          2nd Innings
        </span>
      </div>

      {/* Horizontal milestone steps */}
      <div className="grid grid-cols-6 gap-1 relative">
        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'completed';
          const isCurrent = m.status === 'current';

          return (
            <button
              key={m.id}
              onClick={() => onSelectMilestone(m.id)}
              className={`flex flex-col items-center text-center p-1.5 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-blue-50/80 border border-[#1E5EFF]/40 shadow-xs'
                  : 'hover:bg-slate-100/60'
              }`}
            >
              {/* Indicator icon */}
              <div className="mb-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full bg-[#1E5EFF] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ●
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>

              {/* Title */}
              <span
                className={`text-[11px] leading-tight font-semibold ${
                  isCurrent ? 'text-[#1E5EFF]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {m.label}
              </span>

              {/* Time */}
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                {m.time}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
