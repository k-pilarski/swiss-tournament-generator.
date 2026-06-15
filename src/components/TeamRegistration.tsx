import React, { useState } from 'react';
import { Users, Plus, Trash, AlertCircle, ClipboardList } from 'lucide-react';
import type { TournamentStore } from '../types/tournament';

interface TeamRegistrationProps {
  setTeams: TournamentStore['setTeams'];
}

export const TeamRegistration: React.FC<TeamRegistrationProps> = ({ setTeams }) => {
  const [inputMode, setInputMode] = useState<'sequential' | 'bulk'>('sequential');
  
  // Sequential Mode State
  const [namesList, setNamesList] = useState<string[]>(['', '', '']);
  
  // Bulk Mode State
  const [bulkText, setBulkText] = useState<string>('');

  // General Validation Errors State
  const [errors, setErrors] = useState<string[]>([]);

  // Sequential Handlers
  const handleNameChange = (index: number, value: string) => {
    const updated = [...namesList];
    updated[index] = value;
    setNamesList(updated);
    setErrors([]); // Clear errors on typing
  };

  const handleAddNameField = () => {
    setNamesList([...namesList, '']);
    setErrors([]);
  };

  const handleRemoveNameField = (index: number) => {
    if (namesList.length <= 3) {
      setErrors(['A minimum of 3 participants is required.']);
      return;
    }
    const updated = namesList.filter((_, idx) => idx !== index);
    setNamesList(updated);
    setErrors([]);
  };

  // Submission Validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeErrors: string[] = [];
    let processedNames: string[] = [];

    if (inputMode === 'sequential') {
      processedNames = namesList.map(n => n.trim()).filter(n => n !== '');
      if (processedNames.length < namesList.length) {
        activeErrors.push('Please fill in or remove all empty participant fields.');
      }
    } else {
      processedNames = bulkText
        .split('\n')
        .map(n => n.trim())
        .filter(n => n !== '');
    }

    // Rule: Minimum 3 players
    if (processedNames.length < 3) {
      activeErrors.push('A minimum of 3 participants is required to generate the tournament.');
    }

    // Rule: No duplicate names (case-insensitive checks)
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const name of processedNames) {
      const lowerName = name.toLowerCase();
      if (seen.has(lowerName)) {
        duplicates.add(name);
      }
      seen.add(lowerName);
    }

    if (duplicates.size > 0) {
      activeErrors.push(`Duplicate names are not allowed: ${Array.from(duplicates).join(', ')}`);
    }

    if (activeErrors.length > 0) {
      setErrors(activeErrors);
      return;
    }

    // Submit valid teams to Zustand
    setTeams(processedNames);
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-8 text-white relative">
          <div className="absolute top-4 right-4 opacity-10">
            <Users size={120} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Register Participants</h2>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base">
            Set up the players or teams for the Swiss system tournament. Minimum of 3 participants.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setInputMode('sequential');
                setErrors([]);
              }}
              className={`flex-1 pb-4 text-center text-sm font-semibold border-b-2 transition-colors ${
                inputMode === 'sequential'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} className="inline-block mr-2 -mt-0.5" />
              Sequential List
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('bulk');
                setErrors([]);
              }}
              className={`flex-1 pb-4 text-center text-sm font-semibold border-b-2 transition-colors ${
                inputMode === 'bulk'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardList size={16} className="inline-block mr-2 -mt-0.5" />
              Bulk Paste (Text)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sequential Mode */}
            {inputMode === 'sequential' && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Participant Names
                </label>
                {namesList.map((name, idx) => (
                  <div key={idx} className="flex gap-2 items-center group">
                    <span className="text-xs font-medium text-gray-400 w-6 text-right">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`Participant #${idx + 1}`}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNameField(idx)}
                      disabled={namesList.length <= 3}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Remove participant"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddNameField}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold transition-colors w-full justify-center"
                >
                  <Plus size={14} /> Add Participant
                </button>
              </div>
            )}

            {/* Bulk Mode */}
            {inputMode === 'bulk' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bulk Import Names
                  </label>
                  <span className="text-xs text-gray-400 font-medium">
                    One name per line
                  </span>
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value);
                    setErrors([]);
                  }}
                  rows={8}
                  placeholder="Alpha Team&#10;Beta Team&#10;Gamma Team&#10;Delta Team"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all font-mono text-sm leading-relaxed"
                />
              </div>
            )}

            {/* Errors Panel */}
            {errors.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-1.5">
                {errors.map((error, index) => (
                  <div key={index} className="flex gap-2 items-start text-xs text-rose-700 font-medium">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Actions */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Generate Swiss Tournament
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
