import React from 'react';
import { X, AlertTriangle, Info, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { OperationalAlert } from '../../types/stadium';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: OperationalAlert[];
  onResolveAlert: (id: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Operations & Security Incident Log
              </h2>
              <p className="text-xs text-slate-500">
                Real-time stadium match day alerts & automated queue sensors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              All stadium sectors are operating under optimal thresholds.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                  alert.resolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : alert.level === 'urgent'
                    ? 'bg-red-50/70 border-red-200'
                    : alert.level === 'warning'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-blue-50/70 border-blue-200'
                }`}
              >
                <div className="mt-0.5">
                  {alert.level === 'urgent' ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : alert.level === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Info className="w-4 h-4 text-[#1E5EFF]" />
                  )}
                </div>

                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{alert.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Sector: <strong>{alert.area}</strong></span>
                  </div>
                </div>

                {!alert.resolved && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="self-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold shadow-xs transition"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Incident monitoring automated via sensor mesh</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
