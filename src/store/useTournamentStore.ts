import { create } from 'zustand';
import type { TournamentStore, TournamentStateData, Team } from '../types/tournament';

const initialStoreState: TournamentStateData = {
  teams: [],
  rounds: [],
  currentPhase: 'registration',
  currentRoundNumber: 0,
  bracketGroups: [],
};

export const useTournamentStore = create<TournamentStore>((set) => ({
  ...initialStoreState,
  history: [],

  setTeams: (names) =>
    set((state) => {
      const newTeams: Team[] = names.map((name, index) => ({
        id: `team-${index + 1}`,
        name,
        wins: 0,
        losses: 0,
        byeCount: 0,
        opponentsPlayed: [],
      }));

      // Deep copy state data to history
      const nextHistory = [
        ...state.history,
        {
          teams: JSON.parse(JSON.stringify(state.teams)),
          rounds: JSON.parse(JSON.stringify(state.rounds)),
          currentPhase: state.currentPhase,
          currentRoundNumber: state.currentRoundNumber,
          bracketGroups: JSON.parse(JSON.stringify(state.bracketGroups)),
        },
      ];

      return {
        teams: newTeams,
        currentPhase: 'swiss',
        currentRoundNumber: 1,
        history: nextHistory,
      };
    }),

  generateNextRound: () => {
    // Placeholder action signature for Swiss pairing math
    console.log('generateNextRound placeholder called');
  },

  setMatchWinner: (matchId, winnerId) => {
    // Placeholder action signature for resolving Swiss matches
    console.log('setMatchWinner placeholder called', { matchId, winnerId });
  },

  setBracketMatchWinner: (groupId, matchId, winnerId) => {
    // Placeholder action signature for resolving bracket matches
    console.log('setBracketMatchWinner placeholder called', { groupId, matchId, winnerId });
  },

  undoLastAction: () =>
    set((state) => {
      if (state.history.length === 0) {
        return {};
      }

      const prevHistory = [...state.history];
      const prevState = prevHistory.pop()!;

      return {
        ...prevState,
        history: prevHistory,
      };
    }),

  importState: (importedState) =>
    set((state) => {
      const nextHistory = [
        ...state.history,
        {
          teams: JSON.parse(JSON.stringify(state.teams)),
          rounds: JSON.parse(JSON.stringify(state.rounds)),
          currentPhase: state.currentPhase,
          currentRoundNumber: state.currentRoundNumber,
          bracketGroups: JSON.parse(JSON.stringify(state.bracketGroups)),
        },
      ];

      return {
        teams: importedState.teams || [],
        rounds: importedState.rounds || [],
        currentPhase: importedState.currentPhase || 'registration',
        currentRoundNumber: importedState.currentRoundNumber || 0,
        bracketGroups: importedState.bracketGroups || [],
        history: nextHistory,
      };
    }),
}));
