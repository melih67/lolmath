import React, { useState, useMemo } from 'react';
import { ROLES } from '../constants';
import { getAllChampionNames } from '../services/ddragon';
import { Search, Calculator, Loader2 } from 'lucide-react';

interface HeroInputProps {
  onAnalyze: (myChamp: string, enemyChamp: string, role: string) => void;
  isLoading: boolean;
}

const HeroInput: React.FC<HeroInputProps> = ({ onAnalyze, isLoading }) => {
  const [myChamp, setMyChamp] = useState('');
  const [enemyChamp, setEnemyChamp] = useState('');
  const [role, setRole] = useState(ROLES[0].id);

  // Get champions once
  const allChamps = useMemo(() => getAllChampionNames(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (myChamp && enemyChamp) {
      onAnalyze(myChamp, enemyChamp, role);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        LoL Math Optimizer
      </h1>
      <p className="text-slate-400 text-center mb-8 font-light">
        Calculate the mathematically perfect build for any matchup using real-time data.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Champion */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Your Champion</label>
            <div className="relative group">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                list="champs"
                value={myChamp}
                onChange={(e) => setMyChamp(e.target.value)}
                placeholder="e.g., Yasuo"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Enemy Champion */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Enemy Champion</label>
            <div className="relative group">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
              <input
                type="text"
                list="champs"
                value={enemyChamp}
                onChange={(e) => setEnemyChamp(e.target.value)}
                placeholder="e.g., Yone"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>
        </div>

        <datalist id="champs">
          {allChamps.map(c => <option key={c} value={c} />)}
        </datalist>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300 text-center">Select Role</label>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  role === r.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {r.icon}
                <span className="text-sm font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold shadow-xl transition-all
              ${isLoading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Computing Optimal Path...</span>
              </>
            ) : (
              <>
                <Calculator className="w-6 h-6" />
                <span>Analyze Matchup</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroInput;
