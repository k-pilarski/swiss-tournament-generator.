import React from 'react';
import { Check, Award } from 'lucide-react';
import type { Match, Team } from '../types/tournament';

interface MatchCardProps {
  match: Match;
  team1: Team;
  team2?: Team;
  onSetWinner: (matchId: string, winnerId: string | null) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  team1,
  team2,
  onSetWinner,
}) => {
  const isResolved = match.winnerId !== null;

  if (match.isBye || !team2) {
    return (
      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Bye Match
          </span>
          <div className="font-bold text-gray-800 text-base">{team1.name}</div>
          <div className="text-xs text-gray-500 font-medium">
            Stats: {team1.wins}W - {team1.losses}L
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100/80 text-emerald-800 rounded-xl text-xs font-extrabold border border-emerald-200">
          <Award size={14} /> Auto-Win
        </div>
      </div>
    );
  }

  const isTeam1Winner = match.winnerId === team1.id;
  const isTeam2Winner = match.winnerId === team2.id;

  const handleSelectWinner = (winnerId: string) => {
    // Toggling: if they click the already selected winner, we reset to null (unresolved)
    if (match.winnerId === winnerId) {
      onSetWinner(match.id, null);
    } else {
      onSetWinner(match.id, winnerId);
    }
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md ${
      isResolved ? 'border-gray-100' : 'border-indigo-100/70 ring-1 ring-indigo-50/30'
    }`}>
      {/* Team 1 Area */}
      <div className={`flex items-center justify-between py-2.5 transition-all duration-200 ${
        isResolved && !isTeam1Winner ? 'opacity-40' : 'opacity-100'
      }`}>
        <div className="space-y-0.5 truncate pr-4">
          <div className="font-bold text-gray-800 text-sm sm:text-base truncate">
            {team1.name}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Stats: {team1.wins}W - {team1.losses}L
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSelectWinner(team1.id)}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isTeam1Winner
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          {isTeam1Winner ? (
            <>
              <Check size={12} strokeWidth={3} /> Winner
            </>
          ) : (
            'Mark Winner'
          )}
        </button>
      </div>

      {/* VS Divider */}
      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <span className="relative px-3 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          VS
        </span>
      </div>

      {/* Team 2 Area */}
      <div className={`flex items-center justify-between py-2.5 transition-all duration-200 ${
        isResolved && !isTeam2Winner ? 'opacity-40' : 'opacity-100'
      }`}>
        <div className="space-y-0.5 truncate pr-4">
          <div className="font-bold text-gray-800 text-sm sm:text-base truncate">
            {team2.name}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Stats: {team2.wins}W - {team2.losses}L
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSelectWinner(team2.id)}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isTeam2Winner
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          {isTeam2Winner ? (
            <>
              <Check size={12} strokeWidth={3} /> Winner
            </>
          ) : (
            'Mark Winner'
          )}
        </button>
      </div>
    </div>
  );
};
