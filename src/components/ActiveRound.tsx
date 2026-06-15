import React from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { MatchCard } from './MatchCard';
import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';

export const ActiveRound: React.FC = () => {
  const currentRoundNumber = useTournamentStore((state) => state.currentRoundNumber);
  const rounds = useTournamentStore((state) => state.rounds);
  const teams = useTournamentStore((state) => state.teams);
  const setMatchWinner = useTournamentStore((state) => state.setMatchWinner);
  const generateNextRound = useTournamentStore((state) => state.generateNextRound);

  const activeRound = rounds.find((r) => r.number === currentRoundNumber);

  if (!activeRound) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500 shadow-sm">
        No active round found.
      </div>
    );
  }

  const isRoundComplete = activeRound.isCompleted;
  const totalMatches = activeRound.matches.length;
  const resolvedMatchesCount = activeRound.matches.filter((m) => m.winnerId !== null).length;
  const remainingMatches = totalMatches - resolvedMatchesCount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Swiss System
          </span>
          <h3 className="font-extrabold text-gray-950 text-lg sm:text-xl mt-1">
            Active Round {currentRoundNumber} Matches
          </h3>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2">
          {isRoundComplete ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-sm">
              <CheckCircle2 size={12} /> Ready
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
              In Progress: {resolvedMatchesCount}/{totalMatches}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRound.matches.map((match) => {
            const team1 = teams.find((t) => t.id === match.team1Id)!;
            const team2 = match.team2Id ? teams.find((t) => t.id === match.team2Id) : undefined;

            return (
              <MatchCard
                key={match.id}
                match={match}
                team1={team1}
                team2={team2}
                onSetWinner={setMatchWinner}
              />
            );
          })}
        </div>

        {/* Status Prompt & Button */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50/70 p-3 rounded-xl border border-gray-100 w-full sm:w-auto">
            <Info size={14} className="text-gray-400 shrink-0" />
            {isRoundComplete ? (
              <span>All match outcomes resolved. You can generate the pairings for the next round.</span>
            ) : (
              <span>Please declare winners for all matches ({remainingMatches} remaining).</span>
            )}
          </div>

          <button
            type="button"
            onClick={generateNextRound}
            disabled={!isRoundComplete}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md ${
              isRoundComplete
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
            }`}
          >
            Generate Next Round <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
