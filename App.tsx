import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Generator from './components/Generator';
import ResultDisplay from './components/ResultDisplay';
import Documentation from './components/Documentation';
import HistoryView from './components/HistoryView';
import ExamplesView from './components/ExamplesView';
import { GenerationResult, NavItem } from './types';
import { Layout, FileText, History, BookOpen, LayoutTemplate } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'generator' | 'history' | 'templates' | 'docs'>('generator');
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Auto-run state for when navigating from Templates
  const [autoGenContext, setAutoGenContext] = useState<{ templateId: string; topic: string; autoRun: boolean } | null>(null);

  // Initialize history from localStorage
  const [history, setHistory] = useState<GenerationResult[]>(() => {
    try {
      const saved = localStorage.getItem('scholarcraft_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });

  // Persist history changes
  useEffect(() => {
    localStorage.setItem('scholarcraft_history', JSON.stringify(history));
  }, [history]);

  const navItems: NavItem[] = [
    { id: 'generator', label: 'Generator', icon: Layout },
    { id: 'history', label: 'History', icon: History },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'docs', label: 'Documentation', icon: FileText },
  ];

  const handleResultGenerated = (newResult: GenerationResult) => {
    setResult(newResult);
    setHistory(prev => [...prev, newResult]);
    // Clear auto-gen context after successful generation
    setAutoGenContext(null);
  };

  const handleHistorySelect = (selectedResult: GenerationResult) => {
    setResult(selectedResult);
    setCurrentView('generator');
  };

  const handleHistoryDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      setHistory(prev => prev.filter(item => item.id !== id));
      // If the deleted item is currently displayed, clear it
      if (result?.id === id) {
        setResult(null);
      }
    }
  };

  const handleRunTemplate = (templateId: string, topic: string) => {
    setAutoGenContext({ templateId, topic, autoRun: true });
    setResult(null); // Clear previous results to show generator
    setCurrentView('generator');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            ScholarCraft
          </h1>
          <p className="text-xs text-zinc-500 mt-1">AI Education Suite</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as any);
                  if (item.id !== 'generator') {
                    setResult(null); // Clear active result when moving away from generator
                    setAutoGenContext(null); // Clear auto-gen context
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-800">
          <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Usage Stats</h4>
            <div className="flex justify-between text-sm mb-1">
               <span className="text-zinc-500">Model</span>
               <span className="text-zinc-300">Gemini 2.5</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-zinc-500">History</span>
               <span className="text-emerald-400 flex items-center gap-1">
                 {history.length} items
               </span>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-zinc-600 text-center">
            CAPACITI IS A DIVISION OF FUTURE EDUCATION
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 h-screen overflow-hidden flex flex-col">
        {currentView === 'generator' && (
          result ? (
            <ResultDisplay result={result} onReset={() => setResult(null)} />
          ) : (
            <div className="h-full flex flex-col">
              <header className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Create New Content</h2>
                <p className="text-zinc-400">Select a template and configure your parameters to generate educational material.</p>
              </header>
              <div className="flex-1 min-h-0">
                <Generator 
                   onResultGenerated={handleResultGenerated} 
                   initialContext={autoGenContext}
                />
              </div>
            </div>
          )
        )}
        
        {currentView === 'history' && (
          <HistoryView 
            history={history} 
            onSelect={handleHistorySelect} 
            onDelete={handleHistoryDelete} 
          />
        )}

        {currentView === 'templates' && (
          <ExamplesView onRunTemplate={handleRunTemplate} />
        )}

        {currentView === 'docs' && (
          <Documentation />
        )}
      </main>
    </div>
  );
};

export default App;