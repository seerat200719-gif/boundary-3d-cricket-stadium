import React from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  Shield,
  Sliders,
  CheckCircle,
  AlertCircle,
  Video
} from 'lucide-react';
import { SelectedEntity } from '../../types/stadium';
import { audioEngine } from '../AudioEngine';

interface DetailInspectorProps {
  entity: SelectedEntity | null;
  onClose: () => void;
  onExecuteAction: (actionId: string, entityId: string) => void;
  onZoomIn: () => void;
}

export const DetailInspector: React.FC<DetailInspectorProps> = ({
  entity,
  onClose,
  onExecuteAction,
  onZoomIn,
}) => {
  if (!entity) return null;

  const handleAction = (actionId: string) => {
    audioEngine.playTurnstile();
    onExecuteAction(actionId, entity.id);
  };

  return (
    <aside className="fixed top-16 right-4 w-80 md:w-88 max-h-[calc(100vh-5rem)] bg-white/95 rounded-2xl border border-slate-200/90 shadow-xl text-slate-900 p-4 z-30 pointer-events-auto flex flex-col gap-3.5 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#1E5EFF]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {entity.type.toUpperCase()} INSPECTOR
            </span>
          </div>
          <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
            {entity.title}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {entity.subtitle}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of 4 Live Telemetry Stats */}
      <div className="grid grid-cols-2 gap-2">
        {entity.stats.map((s, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
          >
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide truncate">
              {s.label}
            </div>
            <div className="text-base font-black text-slate-900 font-mono mt-0.5">
              {s.value}
            </div>
            {s.change && (
              <div
                className={`text-[10px] font-semibold mt-0.5 flex items-center gap-0.5 ${
                  s.positive ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {s.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {s.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Description / Telemetry Feed */}
      <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
        <div className="flex items-center gap-1.5 font-bold text-[#1E5EFF] text-[11px] mb-1">
          <Activity className="w-3.5 h-3.5" />
          Tactical Operations Note
        </div>
        {entity.description}
      </div>

      {/* Operational Actions */}
      {entity.operationalActions && entity.operationalActions.length > 0 && (
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Dispatched Actions
          </div>
          <div className="flex flex-col gap-1.5">
            {entity.operationalActions.map((action) => (
              <button
                key={action.actionId}
                onClick={() => handleAction(action.actionId)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#1E5EFF] text-slate-700 hover:text-white text-xs font-semibold transition group shadow-xs"
              >
                <span>{action.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CCTV & 3D Frame Button */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={onZoomIn}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5" />
          Frame In 3D View
        </button>
      </div>
    </aside>
  );
};
