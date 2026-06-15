import { useTournamentStore } from './store/useTournamentStore';
import { TeamRegistration } from './components/TeamRegistration';
import { ActiveRound } from './components/ActiveRound';
import { StandingsTable } from './components/StandingsTable';
import { Trophy, Calendar, Award } from 'lucide-react';

function App() {
  const currentPhase = useTournamentStore((state) => state.currentPhase);
  const teams = useTournamentStore((state) => state.teams);
  const setTeams = useTournamentStore((state) => state.setTeams);
  const rounds = useTournamentStore((state) => state.rounds);
  const currentRoundNumber = useTournamentStore((state) => state.currentRoundNumber);

  const completedRounds = rounds.filter((r) => r.number < currentRoundNumber);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-100">
            <Trophy size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-950 tracking-tight leading-none">
              Swiss Tournament
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-1 uppercase">
              Generator Engine
            </p>
          </div>
        </div>

        {/* Phase Indicator Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">Current Phase:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            currentPhase === 'registration'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : currentPhase === 'brackets'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {currentPhase}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {currentPhase === 'registration' ? (
          <TeamRegistration setTeams={setTeams} />
        ) : currentPhase === 'brackets' ? (
          <div className="text-center p-10 text-2xl font-bold text-gray-700 bg-white rounded-2xl border border-gray-100 shadow-md">
            Tie-breaker Bracket Phase (Coming Soon)
          </div>
        ) : (
          <div className="space-y-8">
            {/* Swiss Active Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Active Matches Column (7/12 width on lg) */}
              <div className="lg:col-span-7">
                <ActiveRound />
              </div>

              {/* Standings Column (5/12 width on lg) */}
              <div className="lg:col-span-5">
                <StandingsTable />
              </div>
            </div>

            {/* Completed Rounds History Section */}
            {completedRounds.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-5 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">
                    Tournament History
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {completedRounds.map((round) => (
                    <div key={round.id} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Round {round.number} Summary
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {round.matches.map((match) => {
                          const t1 = teams.find((t) => t.id === match.team1Id)!;
                          const t2 = match.team2Id ? teams.find((t) => t.id === match.team2Id) : undefined;
                          const isT1Winner = match.winnerId === t1.id;
                          const isT2Winner = t2 && match.winnerId === t2.id;

                          return (
                            <div
                              key={match.id}
                              className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-xs flex items-center justify-between"
                            >
                              <div className="space-y-1 truncate pr-4">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`font-semibold ${isT1Winner ? 'text-gray-900 font-extrabold' : 'text-gray-500'}`}>
                                    {t1.name}
                                  </span>
                                  {isT1Winner && <Award size={10} className="text-amber-500 shrink-0" />}
                                </div>
                                {t2 ? (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className={`font-semibold ${isT2Winner ? 'text-gray-900 font-extrabold' : 'text-gray-500'}`}>
                                      {t2.name}
                                    </span>
                                    {isT2Winner && <Award size={10} className="text-amber-500 shrink-0" />}
                                  </div>
                                ) : (
                                  <span className="text-[9px] uppercase font-bold text-indigo-400">Bye Match</span>
                                )}
                              </div>

                              <div className="shrink-0 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-500 font-bold">
                                {match.isBye ? 'Auto-Win' : 'Completed'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
