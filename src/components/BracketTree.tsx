import React from 'react';
import { BracketNode } from './BracketNode';
import { Award, CheckCircle } from 'lucide-react';
import type { BracketGroup, Team } from '../types/tournament';

interface BracketTreeProps {
  group: BracketGroup;
  teams: Team[];
  onSetWinner: (groupId: string, matchId: string, winnerId: string | null) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  group,
  teams,
  onSetWinner,
}) => {
  // Partition matches
  const gfMatch = group.matches.find((m) => m.nextMatchId === null && !m.isLoserBracket) || group.matches[0];
  const lbMatches = group.matches.filter((m) => m.isLoserBracket);
  const wbMatches = group.matches.filter((m) => !m.isLoserBracket && m.id !== gfMatch.id);

  // Grouping helpers
  const getMatchesByRound = (matchesList: typeof group.matches) => {
    const roundsMap = new Map<number, typeof group.matches>();
    for (const match of matchesList) {
      if (!roundsMap.has(match.roundNumber)) {
        roundsMap.set(match.roundNumber, []);
      }
      roundsMap.get(match.roundNumber)!.push(match);
    }
    // Sort keys ascending
    return Array.from(roundsMap.keys())
      .sort((a, b) => a - b)
      .map((roundNum) => ({
        roundNumber: roundNum,
        matches: roundsMap.get(roundNum)!.sort((a, b) => a.id.localeCompare(b.id)),
      }));
  };

  const wbRounds = getMatchesByRound(wbMatches);
  const lbRounds = getMatchesByRound(lbMatches);

  // Get name of the group for header
  const getGroupTitle = (key: string, teamsCount: number) => {
    const [w, l] = key.split('-');
    return `Tie-breaker Bracket (${w}W - ${l}L) — ${teamsCount} Teams`;
  };

  // Determine final placement message if completed
  const getFinalWinnerName = () => {
    if (!group.isCompleted || !gfMatch || !gfMatch.winnerId) return null;
    const winner = teams.find((t) => t.id === gfMatch.winnerId);
    return winner ? winner.name : null;
  };

  const finalWinner = getFinalWinnerName();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
      {/* Bracket Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">
            {getGroupTitle(group.scoreKey, group.teams.length)}
          </h3>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Determining placements in score tier.
          </p>
        </div>

        {group.isCompleted ? (
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-sm">
            <CheckCircle size={12} /> Resolved
          </span>
        ) : (
          <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-full text-xs font-semibold">
            In Progress
          </span>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Horizontal scroll container for the tree */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="flex flex-col gap-8 min-w-[600px] pr-4">
            
            {/* Winner's Bracket */}
            {wbRounds.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-400 pl-1">
                  Winner's Bracket
                </div>
                <div className="flex gap-8 items-start">
                  {wbRounds.map((round, idx) => (
                    <div key={round.roundNumber} className="flex flex-col gap-6 items-center">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">
                        Round {idx + 1}
                      </div>
                      <div className="flex flex-col gap-6 justify-around h-full">
                        {round.matches.map((match) => (
                          <BracketNode
                            key={match.id}
                            match={match}
                            groupId={group.id}
                            teams={teams}
                            onSetWinner={onSetWinner}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loser's Bracket */}
            {lbRounds.length > 0 && (
              <div className="space-y-4 border-t border-gray-50 pt-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-400 pl-1">
                  Loser's Bracket
                </div>
                <div className="flex gap-8 items-start">
                  {lbRounds.map((round, idx) => (
                    <div key={round.roundNumber} className="flex flex-col gap-6 items-center">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">
                        Round {idx + 1}
                      </div>
                      <div className="flex flex-col gap-6 justify-around">
                        {round.matches.map((match) => (
                          <BracketNode
                            key={match.id}
                            match={match}
                            groupId={group.id}
                            teams={teams}
                            onSetWinner={onSetWinner}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grand Finals (Final Match) */}
            {gfMatch && (
              <div className="space-y-4 border-t border-gray-50 pt-6">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-400 pl-1">
                  Grand Finals
                </div>
                <div className="flex gap-8 items-center">
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1 text-center">
                      Championship
                    </div>
                    <BracketNode
                      match={gfMatch}
                      groupId={group.id}
                      teams={teams}
                      onSetWinner={onSetWinner}
                    />
                  </div>

                  {/* Winner announcement */}
                  {finalWinner && (
                    <div className="ml-4 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm animate-scale-in">
                      <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md">
                        <Award size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                          Winner Declared
                        </div>
                        <div className="text-sm font-extrabold text-amber-950 truncate max-w-[150px]">
                          {finalWinner}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
