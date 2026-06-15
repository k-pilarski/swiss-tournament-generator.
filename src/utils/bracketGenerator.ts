import type { Team, BracketMatch, BracketGroup } from '../types/tournament';

/**
 * Groups teams by their Win/Loss records at the end of the Swiss phase.
 */
export const groupTeamsByRecord = (teams: Team[]): Map<string, Team[]> => {
  const groups = new Map<string, Team[]>();

  for (const team of teams) {
    const key = `${team.wins}-${team.losses}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(team);
  }

  return groups;
};

/**
 * Propagates byes in a bracket list recursively.
 * If a match has only one team and the other is null, it resolves as a bye
 * and propagates the winner forward and the loser (null) to the losers bracket.
 */
export const propagateByes = (matches: BracketMatch[]): void => {
  let changed = true;
  
  while (changed) {
    changed = false;

    for (const match of matches) {
      // If already resolved, skip
      if (match.winnerId !== null) {
        continue;
      }

      const t1 = match.team1Id;
      const t2 = match.team2Id;

      // Case 1: Both teams are null - we cannot resolve it yet
      if (t1 === null && t2 === null) {
        continue;
      }

      // Case 2: One team is present, the other is explicitly null (a Bye)
      const isT1Bye = t1 === null;
      const isT2Bye = t2 === null;

      if (isT1Bye || isT2Bye) {
        const winner = isT1Bye ? t2 : t1;
        match.winnerId = winner;
        match.loserId = null;
        changed = true;

        // Propagate winner
        if (match.nextMatchId) {
          const nextMatch = matches.find((m) => m.id === match.nextMatchId);
          if (nextMatch) {
            if (nextMatch.sourceMatch1Id === match.id) {
              nextMatch.team1Id = winner;
            } else if (nextMatch.sourceMatch2Id === match.id) {
              nextMatch.team2Id = winner;
            } else {
              // Fallback
              if (nextMatch.team1Id === null) {
                nextMatch.team1Id = winner;
              } else if (nextMatch.team2Id === null) {
                nextMatch.team2Id = winner;
              }
            }
          }
        }

        // Propagate loser (null) to losers bracket
        if (match.nextMatchLoserId) {
          const nextLoserMatch = matches.find((m) => m.id === match.nextMatchLoserId);
          if (nextLoserMatch) {
            if (nextLoserMatch.sourceMatch1Id === match.id) {
              nextLoserMatch.team1Id = null;
            } else if (nextLoserMatch.sourceMatch2Id === match.id) {
              nextLoserMatch.team2Id = null;
            } else {
              // Fallback
              if (nextLoserMatch.team1Id === null) {
                nextLoserMatch.team1Id = null;
              } else if (nextLoserMatch.team2Id === null) {
                nextLoserMatch.team2Id = null;
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Generates the double-elimination brackets for groups of tied teams.
 * Only groups with 2 or more teams will receive a bracket.
 */
export const generateBracketsForTiedGroups = (teams: Team[]): BracketGroup[] => {
  const groupsMap = groupTeamsByRecord(teams);
  const bracketGroups: BracketGroup[] = [];

  for (const [scoreKey, tiedTeams] of groupsMap.entries()) {
    if (tiedTeams.length < 2) {
      continue; // No tie-breaker bracket needed for unique standings
    }

    // Sort teams in this group deterministically to define seeds
    const sortedTeams = [...tiedTeams].sort((a, b) => a.id.localeCompare(b.id));
    const teamIds = sortedTeams.map((t) => t.id);
    const N = teamIds.length;
    const groupId = `group-${scoreKey}`;
    
    let matches: BracketMatch[] = [];

    if (N === 2) {
      // 2 Teams: A single head-to-head match
      matches = [
        {
          id: `${groupId}-m1`,
          roundNumber: 1,
          team1Id: teamIds[0],
          team2Id: teamIds[1],
          winnerId: null,
          loserId: null,
          nextMatchId: null,
          nextMatchLoserId: null,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
      ];
    } else if (N === 3) {
      // 3 Teams Double-Elimination
      // Seed 1 gets a bye in round 1. Seed 2 vs Seed 3.
      matches = [
        {
          id: `${groupId}-m1`, // WB Semis
          roundNumber: 1,
          team1Id: teamIds[1],
          team2Id: teamIds[2],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m2`,
          nextMatchLoserId: `${groupId}-m3`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m2`, // WB Finals
          roundNumber: 2,
          team1Id: teamIds[0],
          team2Id: null, // Winner m1
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m4`,
          nextMatchLoserId: `${groupId}-m3`,
          sourceMatch1Id: null,
          sourceMatch2Id: `${groupId}-m1`,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m3`, // LB Finals
          roundNumber: 2,
          team1Id: null, // Loser m1 (bye, but set dynamically)
          team2Id: null, // Loser m2
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m4`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m1`,
          sourceMatch2Id: `${groupId}-m2`,
          isLoserBracket: true,
        },
        {
          id: `${groupId}-m4`, // Grand Finals
          roundNumber: 3,
          team1Id: null, // Winner m2
          team2Id: null, // Winner m3
          winnerId: null,
          loserId: null,
          nextMatchId: null,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m2`,
          sourceMatch2Id: `${groupId}-m3`,
          isLoserBracket: false,
        },
      ];
    } else if (N === 4) {
      // 4 Teams Double-Elimination
      matches = [
        {
          id: `${groupId}-m1`, // WB Semis 1
          roundNumber: 1,
          team1Id: teamIds[0],
          team2Id: teamIds[3],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m4`,
          nextMatchLoserId: `${groupId}-m3`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m2`, // WB Semis 2
          roundNumber: 1,
          team1Id: teamIds[1],
          team2Id: teamIds[2],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m4`,
          nextMatchLoserId: `${groupId}-m3`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m3`, // LB Semis
          roundNumber: 2,
          team1Id: null, // Loser m1
          team2Id: null, // Loser m2
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m5`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m1`,
          sourceMatch2Id: `${groupId}-m2`,
          isLoserBracket: true,
        },
        {
          id: `${groupId}-m4`, // WB Finals
          roundNumber: 2,
          team1Id: null, // Winner m1
          team2Id: null, // Winner m2
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m6`,
          nextMatchLoserId: `${groupId}-m5`,
          sourceMatch1Id: `${groupId}-m1`,
          sourceMatch2Id: `${groupId}-m2`,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m5`, // LB Finals
          roundNumber: 3,
          team1Id: null, // Winner m3
          team2Id: null, // Loser m4
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m6`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m3`,
          sourceMatch2Id: `${groupId}-m4`,
          isLoserBracket: true,
        },
        {
          id: `${groupId}-m6`, // Grand Finals
          roundNumber: 4,
          team1Id: null, // Winner m4
          team2Id: null, // Winner m5
          winnerId: null,
          loserId: null,
          nextMatchId: null,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m4`,
          sourceMatch2Id: `${groupId}-m5`,
          isLoserBracket: false,
        },
      ];
    } else {
      // N > 4: Pad up to 8 teams double-elimination
      const paddedSeeds: (string | null)[] = Array(8).fill(null);
      for (let i = 0; i < N; i++) {
        paddedSeeds[i] = teamIds[i];
      }

      matches = [
        // WB Quarterfinals
        {
          id: `${groupId}-m1`,
          roundNumber: 1,
          team1Id: paddedSeeds[0],
          team2Id: paddedSeeds[7],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m7`,
          nextMatchLoserId: `${groupId}-m5`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m2`,
          roundNumber: 1,
          team1Id: paddedSeeds[3],
          team2Id: paddedSeeds[4],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m7`,
          nextMatchLoserId: `${groupId}-m5`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m3`,
          roundNumber: 1,
          team1Id: paddedSeeds[1],
          team2Id: paddedSeeds[6],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m8`,
          nextMatchLoserId: `${groupId}-m6`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m4`,
          roundNumber: 1,
          team1Id: paddedSeeds[2],
          team2Id: paddedSeeds[5],
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m8`,
          nextMatchLoserId: `${groupId}-m6`,
          sourceMatch1Id: null,
          sourceMatch2Id: null,
          isLoserBracket: false,
        },
        // LB Quarterfinals Round 1
        {
          id: `${groupId}-m5`,
          roundNumber: 2,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m9`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m1`,
          sourceMatch2Id: `${groupId}-m2`,
          isLoserBracket: true,
        },
        {
          id: `${groupId}-m6`,
          roundNumber: 2,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m10`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m3`,
          sourceMatch2Id: `${groupId}-m4`,
          isLoserBracket: true,
        },
        // WB Semifinals
        {
          id: `${groupId}-m7`,
          roundNumber: 2,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m12`,
          nextMatchLoserId: `${groupId}-m10`,
          sourceMatch1Id: `${groupId}-m1`,
          sourceMatch2Id: `${groupId}-m2`,
          isLoserBracket: false,
        },
        {
          id: `${groupId}-m8`,
          roundNumber: 2,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m12`,
          nextMatchLoserId: `${groupId}-m9`,
          sourceMatch1Id: `${groupId}-m3`,
          sourceMatch2Id: `${groupId}-m4`,
          isLoserBracket: false,
        },
        // LB Quarterfinals Round 2
        {
          id: `${groupId}-m9`,
          roundNumber: 3,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m11`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m5`,
          sourceMatch2Id: `${groupId}-m8`,
          isLoserBracket: true,
        },
        {
          id: `${groupId}-m10`,
          roundNumber: 3,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m11`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m6`,
          sourceMatch2Id: `${groupId}-m7`,
          isLoserBracket: true,
        },
        // LB Semifinals
        {
          id: `${groupId}-m11`,
          roundNumber: 4,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m13`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m9`,
          sourceMatch2Id: `${groupId}-m10`,
          isLoserBracket: true,
        },
        // WB Finals
        {
          id: `${groupId}-m12`,
          roundNumber: 3,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m14`,
          nextMatchLoserId: `${groupId}-m13`,
          sourceMatch1Id: `${groupId}-m7`,
          sourceMatch2Id: `${groupId}-m8`,
          isLoserBracket: false,
        },
        // LB Finals
        {
          id: `${groupId}-m13`,
          roundNumber: 5,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: `${groupId}-m14`,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m11`,
          sourceMatch2Id: `${groupId}-m12`,
          isLoserBracket: true,
        },
        // Grand Finals
        {
          id: `${groupId}-m14`,
          roundNumber: 6,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          loserId: null,
          nextMatchId: null,
          nextMatchLoserId: null,
          sourceMatch1Id: `${groupId}-m12`,
          sourceMatch2Id: `${groupId}-m13`,
          isLoserBracket: false,
        },
      ];
    }

    // Propagate standard byes immediately
    propagateByes(matches);

    // If bye propagation immediately resolved all matches (which is possible if N=2 and both were byes - not possible for 2 teams, but in general), check completion
    const isCompleted = matches.every((m) => m.winnerId !== null);

    bracketGroups.push({
      id: groupId,
      scoreKey,
      teams: teamIds,
      matches,
      isCompleted,
    });
  }

  return bracketGroups;
};

/**
 * Derives the exact team rankings within a BracketGroup based on match outcomes.
 * Outputs team IDs in order from 1st to last.
 */
export const getBracketGroupRankings = (group: BracketGroup): string[] => {
  const rankedIds: string[] = [];

  const addId = (id: string | null) => {
    if (id && !rankedIds.includes(id)) {
      rankedIds.push(id);
    }
  };

  const N = group.teams.length;

  if (N === 2) {
    const m1 = group.matches.find((m) => m.id === `${group.id}-m1`);
    if (m1) {
      addId(m1.winnerId);
      addId(m1.loserId);
    }
  } else if (N === 3) {
    const m4 = group.matches.find((m) => m.id === `${group.id}-m4`);
    const m3 = group.matches.find((m) => m.id === `${group.id}-m3`);
    if (m4) {
      addId(m4.winnerId);
      addId(m4.loserId);
    }
    if (m3) {
      addId(m3.loserId);
    }
  } else if (N === 4) {
    const m6 = group.matches.find((m) => m.id === `${group.id}-m6`);
    const m5 = group.matches.find((m) => m.id === `${group.id}-m5`);
    const m3 = group.matches.find((m) => m.id === `${group.id}-m3`);
    if (m6) {
      addId(m6.winnerId);
      addId(m6.loserId);
    }
    if (m5) {
      addId(m5.loserId);
    }
    if (m3) {
      addId(m3.loserId);
    }
  } else if (N > 4) {
    const m14 = group.matches.find((m) => m.id === `${group.id}-m14`);
    const m13 = group.matches.find((m) => m.id === `${group.id}-m13`);
    const m11 = group.matches.find((m) => m.id === `${group.id}-m11`);
    const m9 = group.matches.find((m) => m.id === `${group.id}-m9`);
    const m10 = group.matches.find((m) => m.id === `${group.id}-m10`);
    const m5 = group.matches.find((m) => m.id === `${group.id}-m5`);
    const m6 = group.matches.find((m) => m.id === `${group.id}-m6`);

    if (m14) {
      addId(m14.winnerId);
      addId(m14.loserId);
    }
    if (m13) {
      addId(m13.loserId);
    }
    if (m11) {
      addId(m11.loserId);
    }
    if (m9) {
      addId(m9.loserId);
    }
    if (m10) {
      addId(m10.loserId);
    }
    if (m5) {
      addId(m5.loserId);
    }
    if (m6) {
      addId(m6.loserId);
    }
  }

  // Fallback: append any remaining team IDs in the group that have not been ranked yet
  const remaining = group.teams.filter((id) => !rankedIds.includes(id));
  remaining.sort((a, b) => a.localeCompare(b));
  rankedIds.push(...remaining);

  return rankedIds;
};

/**
 * Calculates final rankings for the entire tournament, grouping by Swiss record
 * and resolving internal rankings using completed bracket results.
 */
export const calculateFinalStandings = (
  teams: Team[],
  bracketGroups: BracketGroup[]
): Team[] => {
  const groupsMap = groupTeamsByRecord(teams);
  
  // Sort Swiss score keys: higher wins first, then fewer losses first
  const sortedScoreKeys = Array.from(groupsMap.keys()).sort((a, b) => {
    const [winsA, lossesA] = a.split('-').map(Number);
    const [winsB, lossesB] = b.split('-').map(Number);
    if (winsA !== winsB) {
      return winsB - winsA;
    }
    return lossesA - lossesB;
  });

  const finalStandings: Team[] = [];

  for (const scoreKey of sortedScoreKeys) {
    const tiedTeams = groupsMap.get(scoreKey)!;
    
    if (tiedTeams.length < 2) {
      finalStandings.push(tiedTeams[0]);
    } else {
      const bracketGroup = bracketGroups.find((g) => g.scoreKey === scoreKey);
      if (bracketGroup) {
        const orderedIds = getBracketGroupRankings(bracketGroup);
        // Map back to Team objects
        const orderedTeams = orderedIds.map((id) => tiedTeams.find((t) => t.id === id)!);
        finalStandings.push(...orderedTeams);
      } else {
        // Fallback: sort alphabetically by ID
        const sortedTied = [...tiedTeams].sort((a, b) => a.id.localeCompare(b.id));
        finalStandings.push(...sortedTied);
      }
    }
  }

  return finalStandings;
};

