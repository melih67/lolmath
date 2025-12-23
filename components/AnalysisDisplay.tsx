import React, { useEffect, useState } from 'react';
import { MatchupAnalysis } from '../types';
import { 
  TrendingUp, 
  Sword, 
  Shield, 
  Brain, 
  Scroll, 
  Target,
  ArrowRight,
  ExternalLink,
  Calculator
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  getChampionIconUrl, 
  getItemIconUrl, 
  getRuneIconUrl, 
  getSpecificChampionData, 
  getSpellIconUrl,
  getPassiveIconUrl,
  getChampionLoadingUrl
} from '../services/ddragon';

interface AnalysisDisplayProps {
  data: MatchupAnalysis;
  sources: { title: string; url: string }[];
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, className?: string }> = ({ 
  title, icon, children, className = "" 
}) => (
  <div className={`bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-xl p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
      <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-100">{title}</h3>
    </div>
    {children}
  </div>
);

// Component to render spell order with real icons
const SkillOrderDisplay: React.FC<{ champion: string, order: string[] }> = ({ champion, order }) => {
    const [spells, setSpells] = useState<any[]>([]);

    useEffect(() => {
        getSpecificChampionData(champion).then(data => {
            if (data && data.spells) {
                setSpells(data.spells);
            }
        });
    }, [champion]);

    const getSpellImage = (key: string) => {
        const indexMap: Record<string, number> = { 'Q': 0, 'W': 1, 'E': 2, 'R': 3 };
        const idx = indexMap[key.toUpperCase()];
        if (spells[idx]) {
            return getSpellIconUrl(spells[idx].image.full);
        }
        return null;
    };

    return (
        <div className="flex items-center gap-2 mb-4">
            {order.map((skill, i) => {
                const imgUrl = getSpellImage(skill);
                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-800 border-2 border-blue-500 rounded relative overflow-hidden shadow-lg shadow-blue-500/20 group">
                                {imgUrl ? (
                                    <img src={imgUrl} alt={skill} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-blue-400">
                                        {skill}
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="font-bold text-white text-lg drop-shadow-md">{skill}</span>
                                </div>
                            </div>
                        </div>
                        {i < order.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600" />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, sources }) => {
  
  const myChampIcon = getChampionIconUrl(data.champion);
  const enemyChampIcon = getChampionIconUrl(data.opponent);
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
        {/* Background Splash Art Composite */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex">
            <div className="w-1/2 h-full bg-cover bg-center" style={{ backgroundImage: `url(${getChampionLoadingUrl(data.champion)})` }}></div>
            <div className="w-1/2 h-full bg-cover bg-center" style={{ backgroundImage: `url(${getChampionLoadingUrl(data.opponent)})` }}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/90 pointer-events-none"></div>

        <div className="flex items-center gap-6 z-10 w-full md:w-auto justify-center md:justify-start">
           <div className="text-center relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-500 overflow-hidden shadow-lg shadow-blue-500/30 mx-auto bg-slate-800">
                <img src={myChampIcon} alt={data.champion} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-bold mt-2 text-blue-100 drop-shadow-md">{data.champion}</h2>
           </div>
           
           <div className="flex flex-col items-center px-4">
              <span className="text-slate-400 text-sm font-mono font-bold">VS</span>
              <div className="h-px w-12 bg-slate-600 my-2"></div>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold bg-slate-900/50 px-2 py-1 rounded">{data.role}</span>
           </div>

           <div className="text-center relative">
              <div className="w-20 h-20 rounded-full border-4 border-red-500 overflow-hidden shadow-lg shadow-red-500/30 mx-auto bg-slate-800">
                <img src={enemyChampIcon} alt={data.opponent} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-bold mt-2 text-red-100 drop-shadow-md">{data.opponent}</h2>
           </div>
        </div>

        <div className="mt-6 md:mt-0 z-10 flex flex-col items-center md:items-end gap-2">
            <div className="bg-slate-800/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-600 shadow-lg">
                <span className="text-slate-400 text-sm block text-center md:text-right">Predicted Win Rate</span>
                <div className="text-3xl font-mono font-bold text-emerald-400">{data.winRatePrediction}</div>
            </div>
            <div className="text-xs text-slate-500 font-mono">
                Patch {data.patch} Data
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Runes */}
        <SectionCard title="Optimal Runes" icon={<Brain className="w-5 h-5" />} className="lg:col-span-1 h-full">
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Primary Tree</h4>
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative group" title={data.runes.keystone}>
                            <img 
                                src={getRuneIconUrl(data.runes.keystone)} 
                                alt={data.runes.keystone} 
                                className="w-12 h-12 rounded-full border-2 border-yellow-500/50 bg-slate-800 p-1"
                            />
                             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 pointer-events-none">
                                {data.runes.keystone}
                            </div>
                        </div>
                        {data.runes.primaryTree.map((rune, i) => (
                             <div key={i} className="relative group" title={rune}>
                                <img 
                                    src={getRuneIconUrl(rune)} 
                                    alt={rune} 
                                    className="w-8 h-8 rounded-full border border-slate-600 bg-slate-800 p-0.5 opacity-90"
                                />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 pointer-events-none">
                                    {rune}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Secondary Tree</h4>
                    <div className="flex flex-wrap gap-3">
                        {data.runes.secondaryTree.map((rune, i) => (
                             <div key={i} className="relative group" title={rune}>
                                <img 
                                    src={getRuneIconUrl(rune)} 
                                    alt={rune} 
                                    className="w-8 h-8 rounded-full border border-slate-600 bg-slate-800 p-0.5 opacity-90"
                                />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 pointer-events-none">
                                    {rune}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
                
                 <div>
                    <h4 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Shards</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.runes.shards.map((shard, i) => {
                            const iconUrl = getRuneIconUrl(shard);
                            return iconUrl ? (
                                <img key={i} src={iconUrl} alt={shard} className="w-6 h-6 bg-slate-800 rounded-full border border-slate-700 p-0.5" title={shard} />
                            ) : (
                                <span key={i} className="px-2 py-1 bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded-full text-[10px]">{shard}</span>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-lg">
                    <h4 className="text-blue-300 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                        <Calculator className="w-3 h-3" /> The Math
                    </h4>
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                        "{data.runes.explanation}"
                    </p>
                </div>
            </div>
        </SectionCard>

        {/* Center Column: Build Path */}
        <SectionCard title="Mathematically Efficient Build" icon={<Sword className="w-5 h-5" />} className="lg:col-span-1 h-full">
            <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Starting Items</h4>
                    <div className="space-y-2">
                        {data.build.starting.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-slate-800/40 p-2 rounded border border-slate-700/50">
                                <img 
                                    src={getItemIconUrl(item.name)} 
                                    alt={item.name} 
                                    className="w-10 h-10 rounded border border-slate-600 bg-slate-900"
                                    onError={(e) => (e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png')}
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-200 block">{item.name}</span>
                                    <span className="text-xs text-slate-400 leading-tight">{item.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h4 className="text-xs font-bold text-amber-500/80 uppercase mb-2">Core Spike</h4>
                    <div className="space-y-2">
                        {data.build.core.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-slate-800/40 p-2 rounded border border-slate-700/50 border-l-2 border-l-amber-500">
                                <img 
                                    src={getItemIconUrl(item.name)} 
                                    alt={item.name} 
                                    className="w-10 h-10 rounded border border-amber-500/30 bg-slate-900"
                                    onError={(e) => (e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png')}
                                />
                                <div>
                                    <span className="text-sm font-semibold text-amber-100 block">{item.name}</span>
                                    <span className="text-xs text-slate-400 leading-tight">{item.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-purple-500/80 uppercase mb-2">Situational / Late</h4>
                    <div className="space-y-2">
                        {data.build.situational.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-slate-800/40 p-2 rounded border border-slate-700/50">
                                <img 
                                    src={getItemIconUrl(item.name)} 
                                    alt={item.name} 
                                    className="w-10 h-10 rounded border border-slate-600 bg-slate-900"
                                    onError={(e) => (e.currentTarget.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png')}
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-200 block">{item.name}</span>
                                    <span className="text-xs text-slate-400 leading-tight">{item.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                 <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400 border border-slate-700">
                    <span className="font-bold text-slate-300">Build Philosophy: </span>
                    {data.build.explanation}
                </div>
            </div>
        </SectionCard>

        {/* Right Column: Skills & Tips */}
        <div className="space-y-6 lg:col-span-1 flex flex-col">
            <SectionCard title="Skill Optimization" icon={<Scroll className="w-5 h-5" />}>
                <SkillOrderDisplay champion={data.champion} order={data.skills.maxOrder} />
                <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-3">
                    {data.skills.explanation}
                </p>
            </SectionCard>

             <SectionCard title="Trading Math" icon={<Target className="w-5 h-5" />} className="flex-grow">
                 <p className="text-sm text-slate-300 whitespace-pre-line mb-4">
                     {data.mathAnalysis.tradingPattern}
                 </p>
                 <div className="mt-4 pt-4 border-t border-slate-800">
                     <h5 className="text-xs font-bold text-emerald-400 uppercase mb-2">Efficiency Analysis</h5>
                     <p className="text-xs text-slate-400 font-mono">
                         {data.mathAnalysis.efficiencyStats}
                     </p>
                 </div>
            </SectionCard>
        </div>
      </div>

      {/* Power Curve Chart */}
      <SectionCard title="Matchup Power Curve" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.powerCurve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                        dataKey="time" 
                        stroke="#94a3b8" 
                        tickFormatter={(val) => `${val}m`} 
                        label={{ value: 'Time (min)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        domain={[0, 100]} 
                        hide
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <ReferenceLine y={50} stroke="#475569" strokeDasharray="5 5" />
                    <Line 
                        type="monotone" 
                        dataKey="myPower" 
                        name="My Power" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                        activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="enemyPower" 
                        name="Enemy Power" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                        activeDot={{ r: 6, stroke: '#f87171', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
            Values represent relative power level (0-100) based on scaling coefficients and item spikes.
        </p>
      </SectionCard>
      
      {/* Sources */}
      {sources.length > 0 && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Data Sources</h4>
              <div className="flex flex-wrap gap-4">
                  {sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                          <ExternalLink className="w-3 h-3" />
                          {source.title || new URL(source.url).hostname}
                      </a>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
};

export default AnalysisDisplay;
