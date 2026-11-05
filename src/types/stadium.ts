export type WeatherType = 'clear' | 'dew' | 'rain' | 'night';

export type CameraArea = 'all' | 'field' | 'stands' | 'gates' | 'parking' | 'metro';

export interface GateData {
  id: string;
  name: string;
  zone: 'North' | 'South' | 'East' | 'West VIP';
  status: 'optimal' | 'moderate' | 'congested';
  openLanes: number;
  totalLanes: number;
  flowRate: number; // people per min
  waitTimeMin: number;
  scannedCount: number;
  targetCount: number;
  position: [number, number, number];
}

export interface StallData {
  id: string;
  name: string;
  category: 'F&B' | 'Beverages' | 'Merch' | 'Snacks';
  queueLength: number; // people in queue
  waitMinutes: number;
  stockLevelPercent: number;
  revenueK: number;
  status: 'active' | 'restocking' | 'high_demand';
  position: [number, number, number];
}

export interface TransportData {
  metroStatus: 'On Schedule' | 'High Crowding' | 'Express Arrival';
  metroIntervalMin: number;
  metroPassengersPerHour: number;
  parkingOccupyPercent: number;
  parkingAvailableSpots: number;
  parkingTotalSpots: number;
  teamBusStatus: 'Escorted' | 'Arrived VIP' | 'In Transit';
  teamBusEta: string;
}

export interface CricketMatchState {
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  overs: number;
  ballsInOver: number;
  targetRuns: number;
  currentRunRate: number;
  requiredRunRate: number;
  batter1: { name: string; runs: number; balls: number; fours: number; sixes: number; onStrike: boolean };
  batter2: { name: string; runs: number; balls: number; fours: number; sixes: number; onStrike: boolean };
  bowler: { name: string; overs: number; runs: number; wickets: number; economy: number };
  lastAction: string;
  isPausedForRain: boolean;
  drsActive?: boolean;
}

export interface OperationalAlert {
  id: string;
  level: 'info' | 'warning' | 'urgent';
  timestamp: string;
  title: string;
  area: string;
  actionText?: string;
  resolved?: boolean;
}

export interface SelectedEntity {
  id: string;
  type: 'gate' | 'stall' | 'pitch' | 'bus' | 'stand' | 'metro' | 'scoreboard' | 'tower';
  title: string;
  subtitle: string;
  stats: { label: string; value: string | number; change?: string; positive?: boolean }[];
  description: string;
  position: [number, number, number];
  operationalActions: { label: string; icon?: string; actionId: string }[];
}
