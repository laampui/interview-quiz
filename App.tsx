import React, { useState } from 'react';
import Sidebar from './components/Controls/Sidebar';
import SnowflakeContainer from './components/Snowflake/SnowflakeContainer';
import {
  SnowflakeDataMap,
  SnowflakeMode,
  DimensionKey,
} from './types';

// Initial Data Generator
const generateMockData = (scores: number[]): SnowflakeDataMap => {
  const keys: DimensionKey[] = ['value', 'future', 'past', 'health', 'dividend'];
  const descs = {
    value: "Calculated based on P/E ratio, PEG ratio, and Price to Book relative to peers and industry average.",
    future: "Analyst forecasts for revenue and earnings growth over the next 1-3 years.",
    past: "Historical earnings performance and growth stability over the last 5 years.",
    health: "Analysis of balance sheet strength, debt levels, and coverage ratios.",
    dividend: "Evaluation of dividend yield, stability, and payout ratios relative to market.",
  };

  return keys.reduce((acc, key, idx) => {
    const score = scores[idx];
    // Generate mock booleans based on score for visualization
    const checks = Array(6).fill(false).map((_, i) => i < score - 1);
    
    acc[key] = {
      key,
      label: key,
      score: score,
      description: descs[key],
      section: checks,
    };
    return acc;
  }, {} as SnowflakeDataMap);
};

const INITIAL_SCORES = [3, 7, 5, 7, 1]; // Matches prompt requirement

const App: React.FC = () => {
  const [data, setData] = useState<SnowflakeDataMap>(generateMockData(INITIAL_SCORES));
  const [mode, setMode] = useState<SnowflakeMode>(SnowflakeMode.COMPANY);
  const [highlightKey, setHighlightKey] = useState<DimensionKey | null>(null);

  const handleUpdateScore = (key: DimensionKey, val: number) => {
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], score: val },
    }));
  };

  const handleSelectHighlight = (key: DimensionKey) => {
    // If clicking same key in TOC mode, maybe toggle off? 
    // Prompt says: "Select ... auto switch to TOC".
    setMode(SnowflakeMode.TOC);
    setHighlightKey(key);
  };

  const handleModeSwitch = (newMode: SnowflakeMode) => {
      setMode(newMode);
      if (newMode === SnowflakeMode.COMPANY) {
          setHighlightKey(null);
      }
  }

  const handleReset = () => {
    setData(generateMockData(INITIAL_SCORES));
    setMode(SnowflakeMode.COMPANY);
    setHighlightKey(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0B101B] p-4 md:p-10">
      <header className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-4xl font-extrabold text-transparent">
          Snowflake Analysis
        </h1>
        <p className="mt-2 text-gray-400">
          Interactive multidimensional equity visualization
        </p>
      </header>

      <div className="flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center">
        {/* Chart Area */}
        <div className="relative flex flex-col items-center">
           {/* Mode Toggles */}
           <div className="mb-6 flex gap-2 rounded-lg bg-gray-800 p-1">
                <button 
                    onClick={() => handleModeSwitch(SnowflakeMode.COMPANY)}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === SnowflakeMode.COMPANY ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    COMPANY
                </button>
                <button 
                    onClick={() => setMode(SnowflakeMode.TOC)}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === SnowflakeMode.TOC ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    TOC
                </button>
           </div>

           <div className="relative rounded-3xl bg-gray-900/50 p-6 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm ring-1 ring-white/5">
               <SnowflakeContainer 
                data={data} 
                mode={mode} 
                highlightKey={highlightKey} 
               />
           </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          data={data}
          onUpdateScore={handleUpdateScore}
          highlightKey={highlightKey}
          onSelectHighlight={handleSelectHighlight}
          onReset={handleReset}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default App;
