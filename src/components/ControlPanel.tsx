import React, { useRef, useState } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { RotateCcw, Save, FolderOpen, AlertTriangle, X } from 'lucide-react';
import type { TournamentStateData } from '../types/tournament';

export const ControlPanel: React.FC = () => {
  const history = useTournamentStore((state) => state.history);
  const undoLastAction = useTournamentStore((state) => state.undoLastAction);
  const importState = useTournamentStore((state) => state.importState);
  
  // State selectors to construct the export payload
  const teams = useTournamentStore((state) => state.teams);
  const rounds = useTournamentStore((state) => state.rounds);
  const currentPhase = useTournamentStore((state) => state.currentPhase);
  const currentRoundNumber = useTournamentStore((state) => state.currentRoundNumber);
  const bracketGroups = useTournamentStore((state) => state.bracketGroups);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Undo Handler
  const handleUndo = () => {
    setErrorMessage(null);
    undoLastAction();
  };

  // State Export (Save)
  const handleExport = () => {
    setErrorMessage(null);
    const statePayload: TournamentStateData = {
      teams,
      rounds,
      currentPhase,
      currentRoundNumber,
      bracketGroups,
    };

    const serialized = JSON.stringify(statePayload, null, 2);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `tournament_state_r${currentRoundNumber}_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // State Import (Load) Validation Schema
  const validateImportedSchema = (data: any): data is TournamentStateData => {
    if (typeof data !== 'object' || data === null) {
      throw new Error('State must be a JSON object.');
    }
    if (!Array.isArray(data.teams)) {
      throw new Error('Missing or invalid "teams" array.');
    }
    if (!Array.isArray(data.rounds)) {
      throw new Error('Missing or invalid "rounds" array.');
    }
    if (!Array.isArray(data.bracketGroups)) {
      throw new Error('Missing or invalid "bracketGroups" array.');
    }
    if (typeof data.currentRoundNumber !== 'number') {
      throw new Error('Missing or invalid "currentRoundNumber" property.');
    }

    const validPhases = ['registration', 'swiss', 'brackets', 'completed'];
    if (!validPhases.includes(data.currentPhase)) {
      throw new Error('Missing or invalid "currentPhase" property.');
    }

    // Deep check teams array structure
    for (const team of data.teams) {
      if (typeof team.id !== 'string' || typeof team.name !== 'string') {
        throw new Error('One or more teams is missing a valid id or name.');
      }
      if (typeof team.wins !== 'number' || typeof team.losses !== 'number') {
        throw new Error('One or more teams has invalid win/loss tracking.');
      }
      if (!Array.isArray(team.opponentsPlayed)) {
        throw new Error('One or more teams is missing an opponentsPlayed list.');
      }
    }

    return true;
  };

  // State Import (Load) File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Failed to read file as text.');
        }

        const parsed = JSON.parse(text);

        if (validateImportedSchema(parsed)) {
          importState(parsed);
          setErrorMessage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input element
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Malformed JSON file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset input element
        }
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read the tournament state file.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Control Panel Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="flex w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping shrink-0" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Tournament Management Console
          </span>
        </div>

        {/* Buttons List */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Undo Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
              history.length > 0
                ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 active:scale-[0.98]'
                : 'bg-gray-50 text-gray-300 border-gray-100 shadow-none cursor-not-allowed'
            }`}
            title="Undo the last action"
          >
            <RotateCcw size={14} /> Undo ({history.length})
          </button>

          {/* Export / Save Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 transition-all active:scale-[0.98]"
            title="Export state as JSON file"
          >
            <Save size={14} /> Save Tournament
          </button>

          {/* Import / Load Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
            title="Import state from JSON file"
          >
            <FolderOpen size={14} /> Load Tournament
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative pr-10 animate-shake">
          <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-extrabold text-rose-800 text-sm">Failed to Load Tournament</h5>
            <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 rounded-lg p-0.5 hover:bg-rose-100/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
