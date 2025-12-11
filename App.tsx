import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import Generator from './components/Generator';
import ResultDisplay from './components/ResultDisplay';
import Documentation from './components/Documentation';
import HistoryView from './components/HistoryView';
import ExamplesView from './components/ExamplesView';
import ChatView from './components/ChatView';
import { GenerationResult, NavItem } from './types';
import { Layout, FileText, History, LayoutTemplate, GraduationCap, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'generator' | 'history' | 'templates' | 'docs' | 'chat'>('generator');
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

  // Persist history changes with quota management
  useEffect(() => {
    try {
      localStorage.setItem('scholarcraft_history', JSON.stringify(history));
    } catch (e) {
      console.warn("LocalStorage quota exceeded. Attempting to optimize storage.");
      
      try {
        // Strategy 1: Remove images (Base64 strings are the main cause of bloat)
        // We create a new array where items do not have the imageUrl property
        const textOnlyHistory = history.map(item => {
           const { imageUrl, ...rest } = item;
           return rest; 
        });
        localStorage.setItem('scholarcraft_history', JSON.stringify(textOnlyHistory));
      } catch (e2) {
        // Strategy 2: If still failing, keep only the last 20 items (text only)
        try {
          const slicedHistory = history.slice(-20).map(item => {
             const { imageUrl, ...rest } = item;
             return rest;
          });
          localStorage.setItem('scholarcraft_history', JSON.stringify(slicedHistory));
        } catch (e3) {
          console.error("Failed to persist history: Storage full", e3);
        }
      }
    }
  }, [history]);

  const navItems: NavItem[] = [
    { id: 'generator', label: 'Generator', icon: Layout },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'docs', label: 'Documentation', icon: FileText },
  ];

  const handleResultGenerated = useCallback((newResult: GenerationResult) => {
    setResult(newResult);
    setHistory(prev => [...prev, newResult]);
    // Clear auto-gen context after successful generation
    setAutoGenContext(null);
  }, []);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <GraduationCap size={20} />
              </div>
              <h1 className="text-xl font-serif font-bold text-slate-900">
                ScholarCraft
              </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">AI Education Suite</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Usage Stats</h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Model</span>
              <span className="text-slate-700 font-medium">Gemini 2.5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">History</span>
              <span className="text-indigo-600 font-bold flex items-center gap-1">
                {history.length} items
              </span>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-400 text-center font-medium">
            CAPACITI / FUTURE EDUCATION
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 h-screen overflow-hidden flex flex-col bg-slate-50/50">
        {currentView === 'generator' && (
          result ? (
            <ResultDisplay result={result} onReset={() => setResult(null)} />
          ) : (
            <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
              <header className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Create New Content</h2>
                <p className="text-slate-500">Select a template and configure your parameters to generate educational material.</p>
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

        {currentView === 'chat' && (
          <ChatView />
        )}
      </main>
    </div>
  );
};

export default App;