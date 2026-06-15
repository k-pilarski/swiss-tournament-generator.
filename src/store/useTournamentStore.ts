import { create } from 'zustand';
import type { TournamentStore, TournamentStateData, Team, Round, BracketMatch } from '../types/tournament';
import { generateSwissPairings } from '../utils/pairingAlgorithm';
import { generateBracketsForTiedGroups, propagateByes } from '../utils/bracketGenerator';

const initialStoreState: TournamentStateData = {
  teams: [],
  rounds: [],
  currentPhase: 'registration',
  currentRoundNumber: 0,
  bracketGroups: [],
};

const getStateSnapshot = (state: TournamentStore): TournamentStateData => ({
  teams: JSON.parse(JSON.stringify(state.teams)),
  rounds: JSON.parse(JSON.stringify(state.rounds)),
  currentPhase: state.currentPhase,
  currentRoundNumber: state.currentRoundNumber,
  bracketGroups: JSON.parse(JSON.stringify(state.bracketGroups)),
});

const recalculateTeamStats = (teams: Team[], rounds: Round[]): Team[] => {
  const teamsMap = new Map<string, Team>(
    teams.map((t) => [
      t.id,
      {
        ...t,
        wins: 0,
        losses: 0,
        byeCount: 0,
        opponentsPlayed: [],
      },
    ])
  );

  // Chronologically iterate through rounds and matches
  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.winnerId === null) {
        continue; // Skip unresolved matches
      }

      if (match.isBye) {
        const team = teamsMap.get(match.team1Id);
        if (team) {
          team.wins += 1;
          team.byeCount += 1;
        }
      } else if (match.team2Id !== null) {
        const team1 = teamsMap.get(match.team1Id);
        const team2 = teamsMap.get(match.team2Id);

        if (team1 && team2) {
          team1.opponentsPlayed.push(team2.id);
          team2.opponentsPlayed.push(team1.id);

          if (match.winnerId === team1.id) {
            team1.wins += 1;
            team2.losses += 1;
          } else if (match.winnerId === team2.id) {
            team2.wins += 1;
            team1.losses += 1;
          }
        }
      }
    }
  }

  return Array.from(teamsMap.values());
};

const clearBracketDescendants = (matchId: string, matches: BracketMatch[]): void => {
  for (const m of matches) {
    let changed = false;
    if (m.sourceMatch1Id === matchId) {
      m.team1Id = null;
      changed = true;
    }
    if (m.sourceMatch2Id === matchId) {
      m.team2Id = null;
      changed = true;
    }

    if (changed) {
      m.winnerId = null;
      m.loserId = null;
      clearBracketDescendants(m.id, matches);
    }
  }
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

      // Generate round 1 pairings immediately
      const firstRoundPairings = generateSwissPairings(newTeams, 1);
      if (!firstRoundPairings) {
        return {};
      }

      const firstRound: Round = {
        id: 'round-1',
        number: 1,
        matches: firstRoundPairings.matches,
        isCompleted: firstRoundPairings.matches.every((m) => m.winnerId !== null),
      };

      const updatedTeams = recalculateTeamStats(newTeams, [firstRound]);

      return {
        teams: updatedTeams,
        rounds: [firstRound],
        currentPhase: 'swiss',
        currentRoundNumber: 1,
        history: [...state.history, getStateSnapshot(state)],
      };
    }),

  generateNextRound: () =>
    set((state) => {
      // 1. Make sure current round is complete
      const currentRound = state.rounds.find((r) => r.number === state.currentRoundNumber);
      if (!currentRound || !currentRound.isCompleted) {
        return {};
      }

      const nextRoundNumber = state.currentRoundNumber + 1;
      const pairings = generateSwissPairings(state.teams, nextRoundNumber);

      if (!pairings) {
        // No valid pairings can be made: transition to brackets
        const generatedBrackets = generateBracketsForTiedGroups(state.teams);
        
        if (generatedBrackets.length > 0) {
          return {
            currentPhase: 'brackets',
            bracketGroups: generatedBrackets,
            history: [...state.history, getStateSnapshot(state)],
          };
        } else {
          // If no ties exist, transition directly to completed
          return {
            currentPhase: 'completed',
            history: [...state.history, getStateSnapshot(state)],
          };
        }
      }

      const nextRound: Round = {
        id: `round-${nextRoundNumber}`,
        number: nextRoundNumber,
        matches: pairings.matches,
        isCompleted: pairings.matches.every((m) => m.winnerId !== null),
      };

      const nextRounds = [...state.rounds, nextRound];
      const updatedTeams = recalculateTeamStats(state.teams, nextRounds);

      return {
        teams: updatedTeams,
        rounds: nextRounds,
        currentRoundNumber: nextRoundNumber,
        history: [...state.history, getStateSnapshot(state)],
      };
    }),

  setMatchWinner: (matchId, winnerId) =>
    set((state) => {
      let matchFound = false;
      const updatedRounds = state.rounds.map((round) => {
        // Only allow modifying the current round's matches
        if (round.number !== state.currentRoundNumber) {
          return round;
        }

        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            matchFound = true;
            return {
              ...match,
              winnerId,
            };
          }
          return match;
        });

        return {
          ...round,
          matches: updatedMatches,
          isCompleted: updatedMatches.every((m) => m.winnerId !== null),
        };
      });

      if (!matchFound) {
        return {};
      }

      const updatedTeams = recalculateTeamStats(state.teams, updatedRounds);

      return {
        rounds: updatedRounds,
        teams: updatedTeams,
        history: [...state.history, getStateSnapshot(state)],
      };
    }),

  setBracketMatchWinner: (groupId, matchId, winnerId) =>
    set((state) => {
      let groupFound = false;

      const updatedBracketGroups = state.bracketGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        groupFound = true;
        const matchesCopy = JSON.parse(JSON.stringify(group.matches)) as BracketMatch[];
        const match = matchesCopy.find((m) => m.id === matchId);

        if (!match) {
          return group;
        }

        // Reset winner and clear downstream matches recursively
        match.winnerId = null;
        match.loserId = null;
        clearBracketDescendants(matchId, matchesCopy);

        if (winnerId !== null) {
          // Set new winner & loser
          match.winnerId = winnerId;
          const loserId = winnerId === match.team1Id ? match.team2Id : match.team1Id;
          match.loserId = loserId;

          // Propagate winner
          if (match.nextMatchId) {
            const nextMatch = matchesCopy.find((m) => m.id === match.nextMatchId);
            if (nextMatch) {
              if (nextMatch.sourceMatch1Id === matchId) {
                nextMatch.team1Id = winnerId;
              } else {
                nextMatch.team2Id = winnerId;
              }
            }
          }

          // Propagate loser
          if (match.nextMatchLoserId && loserId !== null) {
            const loserMatch = matchesCopy.find((m) => m.id === match.nextMatchLoserId);
            if (loserMatch) {
              if (loserMatch.sourceMatch1Id === matchId) {
                loserMatch.team1Id = loserId;
              } else {
                loserMatch.team2Id = loserId;
              }
            }
          }
        }

        // Run bye propagation to handle newly created byes down the tree
        propagateByes(matchesCopy);

        const isCompleted = matchesCopy.every((m) => m.winnerId !== null);

        return {
          ...group,
          matches: matchesCopy,
          isCompleted,
        };
      });

      if (!groupFound) {
        return {};
      }

      // Check if all brackets are now completed
      const allCompleted = updatedBracketGroups.every((g) => g.isCompleted);
      const nextPhase = allCompleted ? 'completed' : 'brackets';

      return {
        bracketGroups: updatedBracketGroups,
        currentPhase: nextPhase,
        history: [...state.history, getStateSnapshot(state)],
      };
    }),

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
