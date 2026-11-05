import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CameraArea, CricketMatchState, GateData, OperationalAlert, SelectedEntity, StallData, TransportData, WeatherType } from './types/stadium';
import { StadiumCanvas } from './components/three/StadiumCanvas';
import { TopNav } from './components/ui/TopNav';
import { KpiCards } from './components/ui/KpiCards';
import { MatchMilestoneTracker, MatchMilestone } from './components/ui/MatchMilestoneTracker';
import { OperationsDrawer } from './components/ui/OperationsDrawer';
import { DetailInspector } from './components/ui/DetailInspector';
import { AlertsModal } from './components/ui/AlertsModal';
import { CharacterStudioModal } from './components/ui/CharacterStudioModal';
import { AvatarEmote } from './components/three/PixarCharacterBuilder';
import { Eye, EyeOff, Radio, Volume2 } from 'lucide-react';

export default function App() {
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [activeArea, setActiveArea] = useState<CameraArea>('all');
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isCharacterStudioOpen, setIsCharacterStudioOpen] = useState<boolean>(false);
  const [avatarOutfit, setAvatarOutfit] = useState<'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit'>('team_blue');
  const [activeAvatarEmote, setActiveAvatarEmote] = useState<{ emote: AvatarEmote; timestamp: number } | null>(null);
  const [simulatedTime, setSimulatedTime] = useState<string>('19:46');

  // Match State
  const [matchState, setMatchState] = useState<CricketMatchState>({
    battingTeam: 'IND',
    bowlingTeam: 'AUS',
    runs: 184,
    wickets: 3,
    overs: 17,
    ballsInOver: 4,
    targetRuns: 199,
    currentRunRate: 10.41,
    requiredRunRate: 10.71,
    batter1: { name: 'V. Kohli', runs: 78, balls: 44, fours: 6, sixes: 3, onStrike: true },
    batter2: { name: 'H. Pandya', runs: 28, balls: 14, fours: 2, sixes: 2, onStrike: false },
    bowler: { name: 'P. Cummins', overs: 3.4, runs: 38, wickets: 1, economy: 10.36 },
    lastAction: 'FOUR! Slashed through backward point!',
    isPausedForRain: false,
  });

  // Gates Data
  const [gates, setGates] = useState<GateData[]>([
    {
      id: 'gate-north',
      name: 'North Gate 1-4',
      zone: 'North',
      status: 'optimal',
      openLanes: 8,
      totalLanes: 10,
      flowRate: 310,
      waitTimeMin: 3.8,
      scannedCount: 15420,
      targetCount: 16500,
      position: [0, 0, -96],
    },
    {
      id: 'gate-south',
      name: 'South Pavilion Gate',
      zone: 'South',
      status: 'optimal',
      openLanes: 6,
      totalLanes: 8,
      flowRate: 240,
      waitTimeMin: 4.1,
      scannedCount: 12890,
      targetCount: 14000,
      position: [0, 0, 96],
    },
    {
      id: 'gate-east',
      name: 'East Metro Concourse',
      zone: 'East',
      status: 'moderate',
      openLanes: 12,
      totalLanes: 14,
      flowRate: 510,
      waitTimeMin: 5.6,
      scannedCount: 21900,
      targetCount: 24000,
      position: [96, 0, 0],
    },
    {
      id: 'gate-west',
      name: 'West VIP & Media Gate',
      zone: 'West VIP',
      status: 'optimal',
      openLanes: 4,
      totalLanes: 4,
      flowRate: 85,
      waitTimeMin: 1.2,
      scannedCount: 4210,
      targetCount: 4500,
      position: [-96, 0, 0],
    },
  ]);

  // Stalls Data
  const [stalls, setStalls] = useState<StallData[]>([
    {
      id: 'stall-biryani',
      name: 'Biryani & Chai Lounge',
      category: 'F&B',
      queueLength: 14,
      waitMinutes: 7.5,
      stockLevelPercent: 78,
      revenueK: 64.2,
      status: 'high_demand',
      position: [45, 0, -65],
    },
    {
      id: 'stall-burgers',
      name: 'Boundary Burgers & Fries',
      category: 'F&B',
      queueLength: 9,
      waitMinutes: 4.2,
      stockLevelPercent: 88,
      revenueK: 52.8,
      status: 'active',
      position: [-45, 0, -65],
    },
    {
      id: 'stall-merch',
      name: 'Official Team India Store',
      category: 'Merch',
      queueLength: 18,
      waitMinutes: 9.0,
      stockLevelPercent: 62,
      revenueK: 118.5,
      status: 'high_demand',
      position: [45, 0, 65],
    },
    {
      id: 'stall-bar',
      name: 'Pavilion Club Beverages',
      category: 'Beverages',
      queueLength: 8,
      waitMinutes: 3.5,
      stockLevelPercent: 91,
      revenueK: 48.0,
      status: 'active',
      position: [-45, 0, 65],
    },
  ]);

  // Transport Data
  const [transport] = useState<TransportData>({
    metroStatus: 'On Schedule',
    metroIntervalMin: 3.5,
    metroPassengersPerHour: 18400,
    parkingOccupyPercent: 88,
    parkingAvailableSpots: 220,
    parkingTotalSpots: 1850,
    teamBusStatus: 'Arrived VIP',
    teamBusEta: 'Arrived',
  });

  // Operational Alerts
  const [alerts, setAlerts] = useState<OperationalAlert[]>([
    {
      id: 'alt-1',
      level: 'warning',
      timestamp: '19:42:15',
      title: 'East Metro Concourse queue surge (+15% flow)',
      area: 'East Turnstile Bank',
      resolved: false,
    },
    {
      id: 'alt-2',
      level: 'info',
      timestamp: '19:38:00',
      title: 'Team Motorcade parked in Secure Bay 1',
      area: 'West VIP Gate',
      resolved: true,
    },
    {
      id: 'alt-3',
      level: 'info',
      timestamp: '19:25:30',
      title: 'Floodlight Tower Array Phase 1-4 sync complete',
      area: 'Stadium Lighting Grid',
      resolved: true,
    },
  ]);

  // Match Milestones
  const milestones: MatchMilestone[] = [
    { id: 'm1', label: 'Gates Open', time: '16:00', status: 'completed', desc: 'Crowd arrival commenced' },
    { id: 'm2', label: 'Toss', time: '18:30', status: 'completed', desc: 'Australia won toss, chose to bat' },
    { id: 'm3', label: 'Powerplay 1', time: '19:00', status: 'completed', desc: 'AUS 54/1 in first 6 overs' },
    { id: 'm4', label: 'Innings Break', time: '20:30', status: 'completed', desc: 'AUS posted 198/5 target' },
    { id: 'm5', label: 'Chase Phase', time: '20:45', status: 'current', desc: 'India chasing 199 for victory' },
    { id: 'm6', label: 'Result & Ceremony', time: '22:15', status: 'upcoming', desc: 'Presentation & crowd egress' },
  ];

  // Confetti on Six!
  const handleScoreUpdate = (newState: CricketMatchState) => {
    if (newState.runs - matchState.runs === 6) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#1E5EFF', '#F59E0B', '#3B82F6', '#FFFFFF'],
        });
      } catch {
        // Ignore if confetti context fails
      }
    }
    setMatchState(newState);
  };

  // Turnstile lane toggling action
  const handleToggleLane = (gateId: string) => {
    setGates((prev) =>
      prev.map((g) => {
        if (g.id === gateId) {
          const nextLanes = g.openLanes < g.totalLanes ? g.openLanes + 1 : Math.max(1, g.openLanes - 1);
          return {
            ...g,
            openLanes: nextLanes,
            waitTimeMin: Number(Math.max(1.2, g.waitTimeMin * (g.openLanes / nextLanes)).toFixed(1)),
          };
        }
        return g;
      })
    );
  };

  // Stall restocking action
  const handleRestockStall = (stallId: string) => {
    setStalls((prev) =>
      prev.map((s) => {
        if (s.id === stallId) {
          return {
            ...s,
            stockLevelPercent: 100,
            status: 'active',
          };
        }
        return s;
      })
    );
  };

  // Operations actions from Right Inspector
  const handleExecuteAction = (actionId: string, entityId: string) => {
    if (actionId === 'open_lane') {
      handleToggleLane(entityId);
    } else if (actionId === 'restock') {
      handleRestockStall(entityId);
    } else if (actionId === 'pitch_covers') {
      setWeather(weather === 'rain' ? 'clear' : 'rain');
    } else if (actionId === 'inspect_character') {
      setIsCharacterStudioOpen(true);
    }
  };

  // Focus entity by clicking table or 3D
  const handleFocusEntity = (id: string, type: 'gate' | 'stall' | 'metro' | 'bus' | 'parking') => {
    if (type === 'gate') {
      setActiveArea('gates');
      const g = gates.find((gate) => gate.id === id);
      if (g) {
        setSelectedEntity({
          id: g.id,
          type: 'gate',
          title: `${g.name} (${g.zone})`,
          subtitle: `${g.openLanes}/${g.totalLanes} Lanes • Wait: ${g.waitTimeMin}m`,
          position: g.position,
          stats: [
            { label: 'Open Lanes', value: `${g.openLanes} / ${g.totalLanes}`, change: '+1 lane', positive: true },
            { label: 'Average Wait', value: `${g.waitTimeMin} mins`, change: '-0.8m', positive: true },
            { label: 'Scanned Total', value: g.scannedCount.toLocaleString() },
            { label: 'Flow Rate', value: `${g.flowRate} pax/min` },
          ],
          description: `Turnstile telemetry continuously monitoring NFC and barcode ticket scans at ${g.name}.`,
          operationalActions: [
            { label: 'Toggle Extra Lane', actionId: 'open_lane' },
            { label: 'Direct Overflow to Gate 2', actionId: 'redirect' },
          ],
        });
      }
    } else if (type === 'stall') {
      const s = stalls.find((stall) => stall.id === id);
      if (s) {
        setSelectedEntity({
          id: s.id,
          type: 'stall',
          title: s.name,
          subtitle: `${s.category} • Queue: ${s.queueLength} fans`,
          position: s.position,
          stats: [
            { label: 'Queue Length', value: `${s.queueLength} fans` },
            { label: 'Wait Time', value: `${s.waitMinutes} mins` },
            { label: 'Stock Level', value: `${s.stockLevelPercent}%` },
            { label: 'Revenue', value: `$${s.revenueK.toFixed(1)}k`, change: '+14%', positive: true },
          ],
          description: `Concession monitoring for inventory supply and fan queue velocity at ${s.name}.`,
          operationalActions: [
            { label: 'Restock Inventory to 100%', actionId: 'restock' },
          ],
        });
      }
    } else if (type === 'metro') {
      setActiveArea('metro');
    } else if (type === 'parking' || type === 'bus') {
      setActiveArea('parking');
    }
  };

  // Keyboard shortcut listener ('H' for Cinema mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsCinemaMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalAttendance = gates.reduce((acc, g) => acc + g.scannedCount, 0);
  const avgWait = gates.reduce((acc, g) => acc + g.waitTimeMin, 0) / gates.length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <StadiumCanvas
        weather={weather}
        activeArea={activeArea}
        gates={gates}
        stalls={stalls}
        onSelectEntity={setSelectedEntity}
        onScoreUpdate={handleScoreUpdate}
        selectedEntityId={selectedEntity?.id}
        avatarOutfit={avatarOutfit}
        activeAvatarEmote={activeAvatarEmote}
      />

      {/* Top Bar Navigation */}
      <TopNav
        weather={weather}
        onWeatherChange={setWeather}
        activeArea={activeArea}
        onAreaChange={setActiveArea}
        alerts={alerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        isCinemaMode={isCinemaMode}
        onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
        simulatedTime={simulatedTime}
        onOpenCharacterStudio={() => setIsCharacterStudioOpen(true)}
      />

      {/* Floating HUD Overlays (collapsible via Cinema Mode) */}
      {!isCinemaMode && (
        <div className="absolute inset-0 pointer-events-none p-3 md:p-5 flex flex-col justify-between pt-16 z-20">
          {/* Top KPI Cards Row */}
          <div className="w-full max-w-4xl">
            <KpiCards
              matchState={matchState}
              attendanceCount={totalAttendance}
              capacityMax={65000}
              averageWaitTimeMin={avgWait}
              onFocusGate={() => setActiveArea('gates')}
              onFocusPitch={() => setActiveArea('field')}
            />
          </div>

          {/* Bottom Controls Row: Timeline + Operations Table */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            {/* Bottom Left: Match Timeline Tracker */}
            <div className="lg:col-span-4">
              <MatchMilestoneTracker
                milestones={milestones}
                onSelectMilestone={(id) => {
                  if (id === 'm5') setActiveArea('field');
                  if (id === 'm1') setActiveArea('gates');
                }}
              />
            </div>

            {/* Bottom Center / Right: Tabbed Operations Drawer */}
            <div className="lg:col-span-8">
              <OperationsDrawer
                gates={gates}
                stalls={stalls}
                transport={transport}
                onFocusEntity={handleFocusEntity}
                onToggleLane={handleToggleLane}
                onRestockStall={handleRestockStall}
              />
            </div>
          </div>
        </div>
      )}

      {/* Right Detail Panel Inspector */}
      {!isCinemaMode && selectedEntity && (
        <DetailInspector
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onExecuteAction={handleExecuteAction}
          onZoomIn={() => {
            if (selectedEntity.type === 'pitch') setActiveArea('field');
            if (selectedEntity.type === 'gate') setActiveArea('gates');
            if (selectedEntity.type === 'metro') setActiveArea('metro');
            if (selectedEntity.type === 'bus') setActiveArea('parking');
          }}
        />
      )}

      {/* Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onResolveAlert={(id) =>
          setAlerts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
          )
        }
      />

      {/* 3D Character Studio Modal */}
      <CharacterStudioModal
        isOpen={isCharacterStudioOpen}
        onClose={() => setIsCharacterStudioOpen(false)}
        onSelectAsAvatar={(outfit) => setAvatarOutfit(outfit as any)}
        onTriggerStadiumEmote={(emote) => {
          setActiveAvatarEmote({ emote, timestamp: Date.now() });
        }}
        onFocusStadiumPitch={() => {
          setActiveArea('field');
        }}
      />

      {/* Active Avatar Emote Toast in Stadium View */}
      {activeAvatarEmote && Date.now() - activeAvatarEmote.timestamp < 4500 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-slate-900/95 text-white border border-pink-400/60 shadow-xl flex items-center gap-2.5 pointer-events-auto animate-in fade-in slide-in-from-top-3">
          <span className="text-lg">
            {activeAvatarEmote.emote === 'clap'
              ? '👏'
              : activeAvatarEmote.emote === 'wave'
              ? '🙋‍♂️'
              : activeAvatarEmote.emote === 'cheer'
              ? '🎉'
              : activeAvatarEmote.emote === 'walk'
              ? '🚶'
              : activeAvatarEmote.emote === 'flex'
              ? '💪'
              : '🙇'}
          </span>
          <div className="text-left leading-tight">
            <div className="text-xs font-black capitalize flex items-center gap-1.5">
              Avatar Emote: {activeAvatarEmote.emote}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-300">Active on Pitch Batter at Crease</div>
          </div>
          <button
            onClick={() => setActiveArea('field')}
            className="ml-2 text-xs font-bold text-pink-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition"
          >
            Zoom to Pitch →
          </button>
        </div>
      )}

      {/* Minimal Cinema Mode exit pill */}
      {isCinemaMode && (
        <button
          onClick={() => setIsCinemaMode(false)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg hover:bg-slate-800 transition flex items-center gap-2 pointer-events-auto"
        >
          <Eye className="w-4 h-4 text-[#1E5EFF]" />
          Exit Cinema Mode (Press H)
        </button>
      )}
    </div>
  );
}
