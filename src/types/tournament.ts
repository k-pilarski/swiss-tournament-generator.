export interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  byeCount: number;
  opponentsPlayed: string[]; // Array of team IDs
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string | null; // null if bye
  winnerId: string | null; // null if pending
  roundNumber: number;
  isBye: boolean;
}

export interface Round {
  id: string;
  number: number;
  matches: Match[];
  isCompleted: boolean;
}

export type TournamentPhase = 'registration' | 'swiss' | 'brackets' | 'completed';

export interface BracketMatch {
  id: string;
  roundNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
  loserId: string | null;
  nextMatchId: string | null; // Match ID where winner goes
  nextMatchLoserId: string | null; // Match ID where loser goes (WB only)
  sourceMatch1Id: string | null; // Match ID where team1 comes from
  sourceMatch2Id: string | null; // Match ID where team2 comes from
  isLoserBracket: boolean;
}

export interface BracketGroup {
  id: string; // Group ID, e.g. "group-3-1" for teams tied at 3 wins, 1 loss
  scoreKey: string; // e.g. "3-1"
  teams: string[]; // Team IDs in this tied group
  matches: BracketMatch[];
  isCompleted: boolean;
}

export interface TournamentStateData {
  teams: Team[];
  rounds: Round[];
  currentPhase: TournamentPhase;
  currentRoundNumber: number;
  bracketGroups: BracketGroup[];
}

export interface TournamentStore extends TournamentStateData {
  history: TournamentStateData[];
  
  // Actions
  setTeams: (names: string[]) => void;
  generateNextRound: () => void;
  setMatchWinner: (matchId: string, winnerId: string | null) => void;
  setBracketMatchWinner: (groupId: string, matchId: string, winnerId: string | null) => void;
  undoLastAction: () => void;
  importState: (state: TournamentStateData) => void;
}
