// ITFTMS 2026 - TypeScript Data Definitions & Enums

export type UserRole = 'SUPER_ADMIN' | 'ORGANIZER' | 'TEAM_MANAGER' | 'REFEREE' | 'STUDENT';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatarUrl?: string;
  studentId?: string;
  class?: string;
  teamId?: string;
  teamName?: string;
  createdAt?: string;
}

export type TournamentStatus =
  | 'DRAFT'
  | 'REGISTRATION'
  | 'REGISTRATION_CLOSED'
  | 'DRAWING'
  | 'GROUP_STAGE'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL'
  | 'COMPLETED';

export interface Tournament {
  id: string;
  name: string;
  shortCode: string;
  year: number;
  organizer: string;
  format: string;
  maxTeams: number;
  maxPlayersPerTeam: number;
  matchDurationMinutes: number;
  breakDurationMinutes: number;
  registrationFee: number;
  depositFee: number;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  description?: string;
  numberOfGroups?: number;  // e.g. 2, 3, 4, 6, 8 (default: 4)
  teamsPerGroup?: number;   // e.g. 3, 4, 5, 6 (default: 4)
  advancePerGroup?: number; // e.g. 1, 2 (default: 2)
}

export const getGroupLetters = (num: number = 4): string[] => {
  const count = Math.max(1, Math.min(26, num || 4));
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, count).split('');
};

export type TeamStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'DISQUALIFIED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FORFEITED';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  teamId: string;
  name: string;
  studentId: string; // MSSV
  class: string;     // Lớp
  cohort: string;    // Khóa: K21, K22, K23, K24...
  dateOfBirth: string;
  jerseyNumber: number;
  position: PlayerPosition;
  avatarUrl?: string;
  yellowCards: number;
  redCards: number;
  isSuspended: boolean;
  suspensionReason?: string;
  goals: number;
  assists: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  class: string;
  department: string;
  leaderName: string;   // Trưởng đoàn
  captainName: string;  // Đội trưởng
  phoneNumber: string;
  email: string;
  primaryColor: string; // Hex color for primary kit
  secondaryColor: string;
  status: TeamStatus;
  feeStatus: PaymentStatus;
  registrationFee: number; // 500,000 VND
  depositFee: number;      // 50,000 VND
  group?: string; // Bảng A, B, C, D, E, F...
  players: Player[];
}

export type VenueStatus = 'AVAILABLE' | 'MAINTENANCE' | 'OCCUPIED';

export interface Venue {
  id: string;
  name: string;
  location: string;
  status: VenueStatus;
}

export interface Referee {
  id: string;
  code: string;
  name: string;
  phoneNumber: string;
  status: 'ACTIVE' | 'BUSY' | 'INACTIVE';
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'CHECKING'
  | 'LIVE'
  | 'HALFTIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

export type CardType = 'YELLOW' | 'SECOND_YELLOW' | 'RED';

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'GOAL' | 'CARD' | 'SUBSTITUTION' | 'NOTE';
  minute: number;
  teamId: string;
  playerId?: string;
  playerName?: string;
  playerInId?: string;
  playerInName?: string;
  playerOutId?: string;
  playerOutName?: string;
  cardType?: CardType;
  assistPlayerId?: string;
  assistPlayerName?: string;
  isOwnGoal?: boolean;
  reason?: string;
  timestamp: string;
}

export interface PenaltyShootout {
  homeScore: number;
  awayScore: number;
  shots: {
    teamId: string;
    round: number;
    scored: boolean;
    playerId?: string;
  }[];
}

export type MatchRound = 'GROUP' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL';

export interface Match {
  id: string;
  matchNumber: number;
  round: MatchRound;
  group?: string; // Bảng A, B, C, D, E, F...
  roundLabel: string; // e.g., "Tứ kết 1", "Bán kết 2", "Vòng bảng - Bảng A"
  venueId: string;
  venueName?: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  homeTeamId: string;
  awayTeamId: string;
  refereeId: string;
  refereeName?: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  currentMinute: number;
  half: 1 | 2;
  penaltyShootout?: PenaltyShootout;
  winnerTeamId?: string;
  events: MatchEvent[];
  completedAt?: string; // ISO string for 15-min complaint window
  needsBtcReview?: boolean;
  reviewReason?: string;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  logo: string;
  played: number; // ST
  won: number;    // T
  drawn: number;  // H
  lost: number;   // B
  goalsFor: number;    // BT
  goalsAgainst: number;// BB
  goalDifference: number; // +/-
  points: number; // Đ
  rank: number;
  needsBtcTieBreak?: boolean;
  btcTieBreakResolved?: boolean;
  isWithdrawn?: boolean;
}

export interface KnockoutBracketItem {
  id: string; // e.g. "TK1", "BK1", "FINAL"
  label: string;
  matchId?: string;
  homeTeam?: {
    id: string;
    name: string;
    logo: string;
    placeholderLabel: string; // e.g. "Nhất bảng A"
    score?: number;
    penaltyScore?: number;
    isWinner?: boolean;
  };
  awayTeam?: {
    id: string;
    name: string;
    logo: string;
    placeholderLabel: string; // e.g. "Nhì bảng B"
    score?: number;
    penaltyScore?: number;
    isWinner?: boolean;
  };
  winnerId?: string;
  status: MatchStatus;
  date?: string;
  time?: string;
  venue?: string;
}

export type ComplaintStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
export type ComplaintType = 'REFEREE_DECISION' | 'PLAYER_ELIGIBILITY' | 'UNSPORTSMANLIKE' | 'FACILITY' | 'OTHER';

export interface Complaint {
  id: string;
  matchId: string;
  teamId: string;
  teamName: string;
  submittedAt: string;
  expiresAt: string; // 15 minutes after match finish
  type: ComplaintType;
  title: string;
  content: string;
  evidenceUrls: string[];
  status: ComplaintStatus;
  reviewerResponse?: string;
  resolvedAt?: string;
}

export type ExpenseCategory =
  | 'VENUE_RENTAL'
  | 'REFEREE'
  | 'TROPHY_MEDALS'
  | 'WATER_MEDICAL'
  | 'BANNER_PRINT'
  | 'PRIZES'
  | 'OTHER';

export type RevenueCategory =
  | 'REGISTRATION_FEE'
  | 'DEPOSIT'
  | 'SPONSORSHIP'
  | 'OTHER';

export interface FinancialTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: RevenueCategory | ExpenseCategory;
  categoryName: string;
  amount: number;
  date: string;
  description: string;
  recipientOrPayer: string;
  teamId?: string;
  receiptUrl?: string;
}

export interface TournamentAward {
  id: string;
  code: 'CHAMPION' | 'RUNNER_UP' | 'THIRD_PLACE' | 'TOP_SCORER' | 'BEST_GK' | 'BEST_PLAYER' | 'FAIR_PLAY';
  title: string;
  recipientName: string;
  recipientTeam: string;
  prizeMoney: number;
  icon: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
  reason?: string;
}
