import React from 'react';
import { Check, HelpCircle } from 'lucide-react';
import type { BracketMatch, Team } from '../types/tournament';

interface BracketNodeProps {
  match: BracketMatch;
  groupId: string;
  teams: Team[];
  onSetWinner: (groupId: string, matchId: string, winnerId: string | null) => void;
}

export const BracketNode: React.FC<BracketNodeProps> = ({
  match,
  groupId,
  teams,
  onSetWinner,
}) => {
  const t1 = match.team1Id ? (teams.find((t) => t.id === match.team1Id) || null) : null;
  const t2 = match.team2Id ? (teams.find((t) => t.id === match.team2Id) || null) : null;

  const isResolved = match.winnerId !== null;
  const isByeMatch = match.winnerId !== null && match.loserId === null;

  const handleWinnerClick = (winnerId: string) => {
    // Toggles selection: if already winner, set to null
    if (match.winnerId === winnerId) {
      onSetWinner(groupId, match.id, null);
    } else {
      onSetWinner(groupId, match.id, winnerId);
    }
  };

  // Helper to render team row inside the node
  const renderTeamRow = (team: Team | null) => {
    if (team === null) {
      return (
        <div className="flex items-center gap-2 py-2 px-3 text-gray-400 italic font-medium border border-dashed border-gray-100 rounded-lg bg-gray-50/30">
          <HelpCircle size={12} className="text-gray-300" />
          <span>TBD</span>
        </div>
      );
    }

    const isWinner = match.winnerId === team.id;
    const isLoser = isResolved && match.winnerId !== team.id;

    // A team is clickable if the opponent is also present and it's not an auto-resolved bye
    const isClickable = (t1 !== null && t2 !== null) && !isByeMatch;

    return (
      <div
        className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-all ${
          isWinner
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold shadow-sm'
            : isLoser
            ? 'bg-white border-gray-100 text-gray-400 opacity-40'
            : 'bg-white border-gray-200 text-gray-700 font-semibold'
        }`}
      >
        <span className="truncate max-w-[120px] font-bold" title={team.name}>
          {team.name}
        </span>

        {isClickable && (
          <button
            type="button"
            onClick={() => handleWinnerClick(team.id)}
            className={`p-1 rounded-md transition-colors border ${
              isWinner
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'
            }`}
            title={`Declare ${team.name} as winner`}
          >
            <Check size={10} strokeWidth={3} />
          </button>
        )}

        {isByeMatch && isWinner && (
          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
            Bye
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`p-3 bg-gray-50/50 rounded-xl border w-56 flex flex-col gap-2 relative transition-all duration-300 hover:shadow-md ${
      isResolved ? 'border-gray-200' : 'border-indigo-100 ring-1 ring-indigo-50/20'
    }`}>
      {/* Match Identifier */}
      <div className="flex justify-between items-center px-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
        <span>{match.id.split('-').pop()?.toUpperCase()}</span>
        {isByeMatch && <span className="text-emerald-600 font-black">Resolved</span>}
      </div>

      {/* Team Rows */}
      {renderTeamRow(t1)}
      {renderTeamRow(t2)}
    </div>
  );
};
