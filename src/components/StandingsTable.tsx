import React from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { calculateStandings } from '../utils/pairingAlgorithm';
import { calculateFinalStandings } from '../utils/bracketGenerator';
import { Trophy, Shield } from 'lucide-react';
import type { Team } from '../types/tournament';

export const StandingsTable: React.FC = () => {
  const teams = useTournamentStore((state) => state.teams);
  const bracketGroups = useTournamentStore((state) => state.bracketGroups);
  const currentPhase = useTournamentStore((state) => state.currentPhase);

  const standings =
    currentPhase === 'brackets' || currentPhase === 'completed'
      ? calculateFinalStandings(teams, bracketGroups)
      : calculateStandings(teams);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black shadow-sm ring-1 ring-amber-200">
            🥇
          </span>
        );
      case 2:
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-black shadow-sm ring-1 ring-slate-200">
            🥈
          </span>
        );
      case 3:
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 text-xs font-black shadow-sm ring-1 ring-orange-200">
            🥉
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-6 h-6 text-gray-400 text-xs font-bold">
            {rank}
          </span>
        );
    }
  };

  const getOpponentAbbreviation = (opponentId: string, allTeams: Team[]) => {
    const opp = allTeams.find((t) => t.id === opponentId);
    if (!opp) return '?';
    // Get first two characters or numbers
    return opp.name.substring(0, 3).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-5 flex items-center gap-2">
        <Trophy size={18} className="text-amber-500" />
        <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">
          Live Standings
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider bg-gray-50/20">
              <th className="py-4 px-6 text-center w-16">Rank</th>
              <th className="py-4 px-4">Participant</th>
              <th className="py-4 px-4 text-center">Wins (W)</th>
              <th className="py-4 px-4 text-center">Losses (L)</th>
              <th className="py-4 px-4 text-center hidden sm:table-cell">Byes</th>
              <th className="py-4 px-4 hidden md:table-cell">Opponents Played</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((team, index) => {
              const rank = index + 1;
              return (
                <tr
                  key={team.id}
                  className="hover:bg-gray-50/50 transition-colors duration-150 text-sm"
                >
                  {/* Rank */}
                  <td className="py-4 px-6 text-center font-bold flex justify-center">
                    {getRankBadge(rank)}
                  </td>
                  
                  {/* Team Name */}
                  <td className="py-4 px-4 font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-xs">{team.name}</span>
                    </div>
                  </td>
                  
                  {/* Wins */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100 text-xs">
                      {team.wins}
                    </span>
                  </td>
                  
                  {/* Losses */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-rose-50 text-rose-700 font-extrabold border border-rose-100 text-xs">
                      {team.losses}
                    </span>
                  </td>
                  
                  {/* Byes */}
                  <td className="py-4 px-4 text-center hidden sm:table-cell text-gray-500 font-semibold">
                    {team.byeCount}
                  </td>
                  
                  {/* Opponents History */}
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {team.opponentsPlayed.length === 0 ? (
                        <span className="text-xs text-gray-400 italic font-normal">None yet</span>
                      ) : (
                        team.opponentsPlayed.map((oppId, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold"
                            title={`Opponent ID: ${oppId}`}
                          >
                            {getOpponentAbbreviation(oppId, teams)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
