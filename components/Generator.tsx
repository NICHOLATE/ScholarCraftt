import React, { useState, useEffect, useCallback } from 'react';
import { EDUCATIONAL_TEMPLATES, SOUTH_AFRICAN_LANGUAGES } from '../constants';
import { GenerationConfig, GenerationResult, Template } from '../types';
import { generateContent } from '../services/geminiService';
import * as Lucide from 'lucide-react';

interface GeneratorProps {
  onResultGenerated: (result: GenerationResult) => void;
  initialContext?: { templateId: string; topic: string; autoRun: boolean } | null;
}

const Generator: React.FC<GeneratorProps> = ({ onResultGenerated, initialContext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(EDUCATIONAL_TEMPLATES[0]);
  
  // Progress State
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  
  const [formData, setFormData] = useState({
    topic: '',
    gradeLevel: 'Grade 10',
    tone: 'Professional',
    depth: 'Detailed',
    language: 'English'
  });

  // Reusable generation function
  const triggerGeneration = useCallback(async (template: Template, configData: typeof formData) => {
     // Client-side validation: Ensure topic is not empty
    if (!configData.topic.trim()) {
      setError("Please enter a topic to begin generation.");
      return;
    }
    setError(null);
    setLoading(true);
    
    // Initialize Progress
    setProgress(5);
    setLoadingText(`Initializing Gemini 2.5 Flash in ${configData.language}...`);

    // Start Simulation Timer
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Hold at 95% until done
        
        // Non-linear progress simulation
        const increment = Math.random() * 5 + 1;
        const newProgress = Math.min(prev + increment, 95);

        // Update Text based on stages
        if (newProgress < 25) setLoadingText("Analyzing prompt constraints...");
        else if (newProgress < 50) setLoadingText(`Drafting ${template.name.toLowerCase()}...`);
        else if (newProgress < 75) setLoadingText("Generating educational imagery...");
        else setLoadingText("Refining output structure...");

        return newProgress;
      });
    }, 600);

    const startTime = performance.now();

    const config: GenerationConfig = {
      ...configData,
      templateId: template.id
    };

    try {
      const { content, imageUrl, quizData } = await generateContent(config, template);
      const endTime = performance.now();
      
      // Complete Progress
      clearInterval(progressInterval);
      setProgress(100);
      setLoadingText("Finalizing content...");
      
      // Small delay to allow user to see 100% state
      await new Promise(resolve => setTimeout(resolve, 600));

      const result: GenerationResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        config,
        content,
        imageUrl,
        quizData,
        durationMs: Math.round(endTime - startTime),
        estimatedTokens: Math.ceil(content.length / 4)
      };

      onResultGenerated(result);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
      setLoading(false); // Only unset loading on error, success unmounts/hides via parent
    }
  }, [onResultGenerated]);

  const handleGenerate = () => {
    triggerGeneration(selectedTemplate, formData);
  };

  // Handle Initial Context (Auto Run)
  useEffect(() => {
    if (initialContext?.autoRun) {
      const template = EDUCATIONAL_TEMPLATES.find(t => t.id === initialContext.templateId) || EDUCATIONAL_TEMPLATES[0];
      const newFormData = { ...formData, topic: initialContext.topic };
      
      // Sync state for UI
      setSelectedTemplate(template);
      setFormData(newFormData);

      // Trigger logic
      triggerGeneration(template, newFormData);
    }
  }, [initialContext, triggerGeneration]);


  const IconComponent = (Lucide as any)[selectedTemplate.icon] || Lucide.FileText;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
          <Lucide.Sliders size={18} className="text-indigo-600" />
          Parameters
        </h2>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Content Type</label>
          <div className="grid grid-cols-1 gap-3">
            {EDUCATIONAL_TEMPLATES.map((t) => {
              const TIcon = (Lucide as any)[t.icon];
              const isSelected = selectedTemplate.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <TIcon size={18} />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{t.name}</div>
                    <div className="text-xs opacity-70 truncate max-w-[180px]">{t.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Topic / Subject <span className="text-red-500">*</span></label>
            <div className="relative">
              <textarea 
                value={formData.topic}
                onChange={(e) => {
                  setFormData({...formData, topic: e.target.value});
                  if (error) setError(null); // Clear error on user input
                }}
                placeholder="e.g. The French Revolution, Quadratic Equations..."
                className={`w-full bg-slate-50 border rounded-lg p-3 pr-12 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:outline-none min-h-[80px] transition-all shadow-inner ${
                  error && !formData.topic.trim() 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-300'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Output Language</label>
            <select 
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:outline-none shadow-sm cursor-pointer"
            >
              {SOUTH_AFRICAN_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Audience</label>
            <select 
              value={formData.gradeLevel}
              onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:outline-none shadow-sm cursor-pointer"
            >
              <option>Kindergarten</option>
              <option>Grade 1-3 (Elementary)</option>
              <option>Grade 4-5 (Upper Elementary)</option>
              <option>Grade 6-8 (Middle School)</option>
              <option>Grade 9-12 (High School)</option>
              <option>University / Adult</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tone</label>
              <select 
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:outline-none shadow-sm cursor-pointer"
              >
                <option>Professional</option>
                <option>Encouraging</option>
                <option>Strict/Academic</option>
                <option>Humorous</option>
                <option>Socratic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Depth</label>
              <select 
                value={formData.depth}
                onChange={(e) => setFormData({...formData, depth: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:outline-none shadow-sm cursor-pointer"
              >
                <option>Brief Overview</option>
                <option>Standard</option>
                <option>Detailed</option>
                <option>Deep Dive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button or Progress Bar */}
        {loading ? (
          <div className="w-full mt-8 bg-white rounded-xl border border-indigo-100 p-4 relative overflow-hidden shadow-lg shadow-indigo-100/50">
            {/* Background Fill Animation */}
            <div 
              className="absolute top-0 left-0 bottom-0 bg-indigo-50 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
                 <Lucide.Loader2 className="animate-spin" size={20} /> 
                 {Math.round(progress)}%
              </div>
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider animate-pulse">
                {loadingText}
              </div>
            </div>

            {/* Bottom Progress Line */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 transform hover:-translate-y-0.5 active:translate-y-0`}
          >
            <Lucide.Sparkles /> Generate Content
          </button>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2 animate-fade-in">
            <Lucide.AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Preview / Placeholder Area */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-slate-400 min-h-[400px]">
        <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-6">
          <IconComponent size={40} className="opacity-40 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Create</h3>
        <p className="max-w-md text-center text-slate-500">
          Configure your parameters on the left and hit Generate. 
          ScholarCraft will formulate your {selectedTemplate.name.toLowerCase()} instantly.
        </p>
      </div>
    </div>
  );
};

export default Generator;