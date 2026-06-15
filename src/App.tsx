import { useTournamentStore } from './store/useTournamentStore';
import { TeamRegistration } from './components/TeamRegistration';
import { Trophy, HelpCircle, Layers, Users } from 'lucide-react';

function App() {
  const currentPhase = useTournamentStore((state) => state.currentPhase);
  const teams = useTournamentStore((state) => state.teams);
  const setTeams = useTournamentStore((state) => state.setTeams);

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
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Active Phase Banner */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                  <Layers size={12} /> Swiss Pairing Stage
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Swiss Phase Active Placeholder
                </h2>
                <p className="text-gray-500 text-sm max-w-md">
                  The tournament has been successfully initialized. The core pairing logic and matches list will be rendered here in the next phase.
                </p>
              </div>

              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl shrink-0">
                <HelpCircle size={40} className="animate-pulse" />
              </div>
            </div>

            {/* Registered Teams Listing Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h3 className="font-bold text-gray-950 text-sm sm:text-base flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  Registered Participants ({teams.length})
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50/70 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold shrink-0">
                        {team.id.replace('team-', '')}
                      </span>
                      <span className="font-semibold text-gray-800 text-sm truncate">
                        {team.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
