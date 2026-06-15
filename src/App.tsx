import { useTournamentStore } from './store/useTournamentStore';
import { TeamRegistration } from './components/TeamRegistration';
import { ActiveRound } from './components/ActiveRound';
import { StandingsTable } from './components/StandingsTable';
import { ControlPanel } from './components/ControlPanel';
import { BracketTree } from './components/BracketTree';
import { Trophy, Calendar, Award, Layers } from 'lucide-react';
import { calculateFinalStandings, getBracketGroupRankings } from './utils/bracketGenerator';

function App() {
  const currentPhase = useTournamentStore((state) => state.currentPhase);
  const teams = useTournamentStore((state) => state.teams);
  const setTeams = useTournamentStore((state) => state.setTeams);
  const rounds = useTournamentStore((state) => state.rounds);
  const currentRoundNumber = useTournamentStore((state) => state.currentRoundNumber);
  const bracketGroups = useTournamentStore((state) => state.bracketGroups);
  const setBracketMatchWinner = useTournamentStore((state) => state.setBracketMatchWinner);

  const completedRounds = rounds.filter((r) => r.number < currentRoundNumber || currentPhase === 'completed');

  // Calculate podium order for completed phase
  const finalStandings = calculateFinalStandings(teams, bracketGroups);
  const podiumTeams = finalStandings.slice(0, 3);

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
              : currentPhase === 'completed'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {currentPhase}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <ControlPanel />
        
        {currentPhase === 'registration' ? (
          <TeamRegistration setTeams={setTeams} />
        ) : currentPhase === 'brackets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Brackets List (7/12 width) */}
            <div className="lg:col-span-7 space-y-8">
              {bracketGroups.map((group) => (
                <BracketTree
                  key={group.id}
                  group={group}
                  teams={teams}
                  onSetWinner={setBracketMatchWinner}
                />
              ))}
            </div>

            {/* Standings List (5/12 width) */}
            <div className="lg:col-span-5">
              <StandingsTable />
            </div>
          </div>
        ) : currentPhase === 'completed' ? (
          <div className="space-y-8 animate-scale-in">
            {/* Podium Visualizer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
                  👑 Tournament Concluded
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
                  Congratulations to the Champion!
                </h2>
              </div>

              {/* Podium Flex Row */}
              <div className="flex flex-col sm:flex-row justify-center items-end gap-6 pt-6 max-w-2xl mx-auto">
                {/* 2nd Place */}
                {podiumTeams[1] && (
                  <div className="flex flex-col items-center justify-end bg-gradient-to-t from-slate-100/70 to-white border border-slate-200/80 p-5 rounded-2xl w-full sm:w-44 text-center h-48 shadow-sm order-1 hover:shadow-md transition-all duration-300">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-800 text-lg font-black mb-3">
                      🥈
                    </span>
                    <div className="font-extrabold text-gray-950 text-sm truncate w-full">
                      {podiumTeams[1].name}
                    </div>
                    <div className="text-xs text-slate-500 font-bold mt-1">
                      {podiumTeams[1].wins}W - {podiumTeams[1].losses}L
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                      2nd Place
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {podiumTeams[0] && (
                  <div className="flex flex-col items-center justify-end bg-gradient-to-t from-amber-100/30 to-white border border-amber-200 p-6 rounded-2xl w-full sm:w-48 text-center h-56 shadow-md order-2 ring-2 ring-amber-400/20 transform hover:scale-105 transition-all duration-300">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800 text-2xl font-black mb-4 animate-bounce">
                      🏆
                    </span>
                    <div className="font-black text-gray-950 text-base truncate w-full">
                      {podiumTeams[0].name}
                    </div>
                    <div className="text-xs text-amber-700 font-extrabold mt-1">
                      {podiumTeams[0].wins}W - {podiumTeams[0].losses}L
                    </div>
                    <div className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider mt-2 bg-amber-50 px-2 py-0.5 rounded">
                      Champion
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {podiumTeams[2] && (
                  <div className="flex flex-col items-center justify-end bg-gradient-to-t from-orange-100/10 to-white border border-orange-200/80 p-5 rounded-2xl w-full sm:w-44 text-center h-40 shadow-sm order-3 hover:shadow-md transition-all duration-300">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-800 text-lg font-black mb-2">
                      🥉
                    </span>
                    <div className="font-extrabold text-gray-950 text-sm truncate w-full">
                      {podiumTeams[2].name}
                    </div>
                    <div className="text-xs text-orange-500 font-bold mt-1">
                      {podiumTeams[2].wins}W - {podiumTeams[2].losses}L
                    </div>
                    <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-2">
                      3rd Place
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standings Table Card */}
            <div className="max-w-4xl mx-auto w-full">
              <StandingsTable />
            </div>

            {/* Brackets History */}
            {bracketGroups.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden max-w-4xl mx-auto w-full">
                <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
                  <Layers className="text-indigo-600" size={16} />
                  <h3 className="font-extrabold text-gray-950 text-sm sm:text-base">
                    Tie-breaker Bracket Placements
                  </h3>
                </div>
                <div className="p-6 divide-y divide-gray-50">
                  {bracketGroups.map((group) => {
                    const sortedOrder = getBracketGroupRankings(group);
                    return (
                      <div key={group.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                        <div className="font-extrabold text-gray-800 text-xs sm:text-sm">
                          Placement group for tier ({group.scoreKey})
                        </div>
                        <div className="flex gap-2.5 flex-wrap items-center">
                          {sortedOrder.map((id, index) => {
                            const team = teams.find((t) => t.id === id);
                            if (!team) return null;
                            return (
                              <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl font-semibold text-gray-700 text-xs">
                                <span className="w-5 h-5 flex items-center justify-center bg-gray-200 text-gray-700 text-[10px] rounded-full font-black">
                                  {index + 1}
                                </span>
                                <span>{team.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Swiss Rounds History */}
            {completedRounds.length > 0 && (
              <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-600" />
                  <h3 className="font-extrabold text-gray-950 text-sm sm:text-base">
                    Swiss Rounds Log
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {completedRounds.map((round) => (
                    <div key={round.id} className="space-y-3 border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
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
                                  <span className={`font-semibold ${isT1Winner ? 'text-gray-900 font-extrabold animate-fade-in' : 'text-gray-500'}`}>
                                    {t1.name}
                                  </span>
                                  {isT1Winner && <Award size={10} className="text-amber-500 shrink-0" />}
                                </div>
                                {t2 ? (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className={`font-semibold ${isT2Winner ? 'text-gray-900 font-extrabold animate-fade-in' : 'text-gray-500'}`}>
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
        ) : (
          <div className="space-y-8 animate-fade-in">
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
