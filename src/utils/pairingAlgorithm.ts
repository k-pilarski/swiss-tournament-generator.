import type { Team, Match } from '../types/tournament';

/**
 * Calculates current standings by sorting teams:
 * 1. Wins (descending)
 * 2. Losses (ascending)
 * 3. ID/Name (alphabetical/deterministic tie-breaker)
 */
export const calculateStandings = (teams: Team[]): Team[] => {
  return [...teams].sort((a, b) => {
    if (a.wins !== b.wins) {
      return b.wins - a.wins; // More wins first
    }
    if (a.losses !== b.losses) {
      return a.losses - b.losses; // Fewer losses first
    }
    return a.id.localeCompare(b.id); // Deterministic tie-breaker
  });
};

/**
 * Determines if two teams can play against each other.
 * Rematches are forbidden if they played in the last 3 rounds.
 */
export const canTeamsPlay = (teamA: Team, teamB: Team): boolean => {
  if (teamA.id === teamB.id) return false;
  
  // Win-difference tolerance: reject if difference is 2 or more
  if (Math.abs(teamA.wins - teamB.wins) >= 2) return false;
  
  // Cooldown constraint: check last 3 opponents
  const lastOpponents = teamA.opponentsPlayed.slice(-3);
  return !lastOpponents.includes(teamB.id);
};

/**
 * Generates the Swiss pairings for a given list of teams and round number.
 * Returns null if no valid pairings can be found due to cooldown deadlocks.
 */
export const generateSwissPairings = (
  teams: Team[],
  roundNumber: number
): { matches: Match[]; byeTeamId: string | null } | null => {
  const standings = calculateStandings(teams);
  const isOdd = standings.length % 2 !== 0;
  
  let byeTeamId: string | null = null;
  let teamsToPair = [...standings];

  // 1. Handle Bye if the number of teams is odd
  if (isOdd) {
    // Find the lowest ranked team that has not had a bye yet
    const byeCandidate = [...standings]
      .reverse() // Start from lowest rank
      .find((team) => team.byeCount === 0);

    if (!byeCandidate) {
      // It is mathematically impossible to assign a bye if everyone already had one.
      // In a normal tournament, this shouldn't happen unless rounds > teams.
      return null;
    }

    byeTeamId = byeCandidate.id;
    teamsToPair = teamsToPair.filter((t) => t.id !== byeTeamId);
  }

  // 2. Perform Backtracking Pairing for the remaining teams
  const pairings = backtrackPairings(teamsToPair, roundNumber, 0);
  if (!pairings) {
    return null; // Deadlock: no valid pairings exist without violating cooldown
  }

  // 3. Append the Bye match if applicable
  const matches: Match[] = [...pairings];
  if (byeTeamId) {
    matches.push({
      id: `match-r${roundNumber}-bye`,
      team1Id: byeTeamId,
      team2Id: null,
      winnerId: byeTeamId, // Bye gets an automatic win
      roundNumber,
      isBye: true,
    });
  }

  return {
    matches,
    byeTeamId,
  };
};

/**
 * Recursive backtracking helper to find a valid pairing.
 * Priority is given to pairing teams with similar standings.
 */
const backtrackPairings = (
  teams: Team[],
  roundNumber: number,
  matchIndexOffset: number
): Match[] | null => {
  if (teams.length === 0) {
    return [];
  }

  const firstTeam = teams[0];
  const candidates = teams.slice(1);

  // Sort candidates by proximity of score (wins/losses) to firstTeam
  const sortedCandidates = [...candidates].sort((a, b) => {
    const scoreDiffA = Math.abs(a.wins - firstTeam.wins) + Math.abs(a.losses - firstTeam.losses);
    const scoreDiffB = Math.abs(b.wins - firstTeam.wins) + Math.abs(b.losses - firstTeam.losses);
    if (scoreDiffA !== scoreDiffB) {
      return scoreDiffA - scoreDiffB; // Closest score diff first
    }
    // As a secondary tiebreaker, sort alphabetically by ID
    return a.id.localeCompare(b.id);
  });

  for (const candidate of sortedCandidates) {
    if (canTeamsPlay(firstTeam, candidate) && canTeamsPlay(candidate, firstTeam)) {
      // Try pairing firstTeam with candidate
      const currentMatch: Match = {
        id: `match-r${roundNumber}-${matchIndexOffset + 1}`,
        team1Id: firstTeam.id,
        team2Id: candidate.id,
        winnerId: null,
        roundNumber,
        isBye: false,
      };

      // Recursively pair the remaining teams
      const remainingTeams = candidates.filter((t) => t.id !== candidate.id);
      const subResult = backtrackPairings(remainingTeams, roundNumber, matchIndexOffset + 1);

      if (subResult !== null) {
        return [currentMatch, ...subResult];
      }
    }
  }

  return null; // Backtrack: no valid pairing found with any of the candidates
};
