import React, { useState } from 'react';
import {
  DoorClosed,
  ShoppingBag,
  Bus,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { GateData, StallData, TransportData } from '../../types/stadium';
import { audioEngine } from '../AudioEngine';

interface OperationsDrawerProps {
  gates: GateData[];
  stalls: StallData[];
  transport: TransportData;
  onFocusEntity: (id: string, type: 'gate' | 'stall' | 'metro' | 'bus' | 'parking') => void;
  onToggleLane: (gateId: string) => void;
  onRestockStall: (stallId: string) => void;
}

export const OperationsDrawer: React.FC<OperationsDrawerProps> = ({
  gates,
  stalls,
  transport,
  onFocusEntity,
  onToggleLane,
  onRestockStall,
}) => {
  const [activeTab, setActiveTab] = useState<'gates' | 'stalls' | 'transport'>('gates');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/95 rounded-xl border border-slate-200/90 shadow-md text-slate-900 overflow-hidden pointer-events-auto transition-all duration-300">
      {/* Header Bar with Tabs and Expand/Collapse */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50/80 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTab('gates');
              setIsExpanded(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'gates'
                ? 'bg-white text-[#1E5EFF] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DoorClosed className="w-3.5 h-3.5" />
            Gates ({gates.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('stalls');
              setIsExpanded(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'stalls'
                ? 'bg-white text-[#1E5EFF] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Stalls ({stalls.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('transport');
              setIsExpanded(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'transport'
                ? 'bg-white text-[#1E5EFF] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            Transit & VIP
          </button>
        </div>

        {/* Toggle Expand / Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200/50 transition"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Live Feed'}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-3 max-h-60 overflow-y-auto">
          {/* TAB 1: GATES */}
          {activeTab === 'gates' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Gate / Zone</th>
                    <th className="pb-2">Turnstiles</th>
                    <th className="pb-2">Flow Rate</th>
                    <th className="pb-2">Wait Time</th>
                    <th className="pb-2">Scanned</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gates.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => onFocusEntity(g.id, 'gate')}
                    >
                      <td className="py-2 font-bold text-slate-800">
                        {g.name} <span className="text-[10px] text-slate-400">({g.zone})</span>
                      </td>
                      <td className="py-2 font-mono">
                        {g.openLanes} / {g.totalLanes} lanes
                      </td>
                      <td className="py-2 text-slate-600 font-mono">
                        {g.flowRate} pax/min
                      </td>
                      <td className="py-2">
                        <span
                          className={`font-mono font-bold ${
                            g.waitTimeMin > 6 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {g.waitTimeMin} mins
                        </span>
                      </td>
                      <td className="py-2 font-mono text-slate-600">
                        {g.scannedCount.toLocaleString()}
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            g.status === 'optimal'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLane(g.id);
                          }}
                          className="px-2 py-0.5 rounded bg-blue-50 text-[#1E5EFF] hover:bg-blue-100 text-[11px] font-semibold transition"
                        >
                          {g.openLanes < g.totalLanes ? '+1 Lane' : '-1 Lane'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: STALLS */}
          {activeTab === 'stalls' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Kiosk / Concession</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Queue (Wait)</th>
                    <th className="pb-2">Stock Level</th>
                    <th className="pb-2">Revenue</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stalls.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => onFocusEntity(s.id, 'stall')}
                    >
                      <td className="py-2 font-bold text-slate-800">{s.name}</td>
                      <td className="py-2 text-slate-500">{s.category}</td>
                      <td className="py-2 font-mono">
                        {s.queueLength} fans{' '}
                        <span className="text-slate-400">({s.waitMinutes}m)</span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                s.stockLevelPercent < 30
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${s.stockLevelPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-600">
                            {s.stockLevelPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2 font-mono font-bold text-slate-800">
                        ${s.revenueK.toFixed(1)}k
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestockStall(s.id);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: TRANSPORT */}
          {activeTab === 'transport' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Metro Station Card */}
              <div
                onClick={() => onFocusEntity('metro', 'metro')}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#1E5EFF]" />
                    Metro Interchange
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                    {transport.metroStatus}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>Headway: <strong className="font-mono">{transport.metroIntervalMin} mins</strong></div>
                  <div>Flow: <strong className="font-mono">{transport.metroPassengersPerHour.toLocaleString()} pax/hr</strong></div>
                </div>
              </div>

              {/* Parking Lot Card */}
              <div
                onClick={() => onFocusEntity('parking', 'parking')}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-amber-500" />
                    Parking Lots A & B
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-[#1E5EFF] font-bold rounded">
                    {transport.parkingOccupyPercent}% FULL
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>Free Bays: <strong className="font-mono text-emerald-600">{transport.parkingAvailableSpots}</strong> / {transport.parkingTotalSpots}</div>
                  <div>Automated Boom Gates: <strong className="text-slate-800">4 Active</strong></div>
                </div>
              </div>

              {/* Team Bus Convoy */}
              <div
                onClick={() => onFocusEntity('bus', 'bus')}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    Team Coach & Escort
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                    {transport.teamBusStatus}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>Location: <strong>VIP Motorcade Bay</strong></div>
                  <div>Security: <strong className="text-emerald-600">Green Corridor Clear</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
