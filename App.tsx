import React, { useState, useEffect } from 'react';
import HeroInput from './components/HeroInput';
import AnalysisDisplay from './components/AnalysisDisplay';
import { analyzeMatchup } from './services/geminiService';
import { initDDragon } from './services/ddragon';
import { MatchupAnalysis } from './types';
import { AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [data, setData] = useState<MatchupAnalysis | null>(null);
  const [sources, setSources] = useState<{title: string, url: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      await initDDragon();
      setInitializing(false);
    };
    loadAssets();
  }, []);

  const handleAnalyze = async (myChamp: string, enemyChamp: string, role: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const result = await analyzeMatchup(myChamp, enemyChamp, role);
      if (result.data) {
        setData(result.data);
        setSources(result.sources);
      } else {
        setError("Could not generate valid analysis data. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while contacting the oracle.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-50">
         <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
         <h2 className="text-xl font-bold font-mono">Loading Data Dragon...</h2>
         <p className="text-slate-500 text-sm mt-2">Fetching Patch 14+ Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      {/* Navbar placeholder */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2 font-mono font-bold text-xl tracking-tighter">
             <div className="w-3 h-3 bg-blue-500 rotate-45"></div>
             LoL.Math()
           </div>
           <div className="text-xs text-slate-500 hidden md:block">
             Powered by Gemini 3.0 Pro
           </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-10 flex flex-col items-center">
        
        {!data && (
            <div className={`transition-all duration-500 ${loading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                <HeroInput onAnalyze={handleAnalyze} isLoading={loading} />
            </div>
        )}

        {loading && (
             <div className="mt-12 text-center space-y-4">
                 <div className="inline-block relative">
                     <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-blue-400">AI</div>
                 </div>
                 <p className="text-slate-400 animate-pulse">Consulting the meta database...</p>
                 <div className="flex gap-2 justify-center text-xs text-slate-600 font-mono">
                    <span>Searching Patches...</span>
                    <span>•</span>
                    <span>Calculating DPS...</span>
                    <span>•</span>
                    <span>Optimizing Path...</span>
                 </div>
             </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-200 max-w-2xl animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="w-full mt-8">
             <div className="mb-6 flex justify-center">
                 <button 
                    onClick={() => setData(null)}
                    className="text-sm text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
                 >
                    ← New Analysis
                 </button>
             </div>
             <AnalysisDisplay data={data} sources={sources} />
          </div>
        )}

      </main>

      <footer className="mt-20 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>Not affiliated with Riot Games.</p>
        <p className="mt-2 text-xs">Generated content may produce inaccurate results. Verify with in-game testing.</p>
      </footer>
    </div>
  );
};

export default App;
