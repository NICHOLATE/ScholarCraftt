import React, { useState, useEffect, useCallback } from 'react';
import { EDUCATIONAL_TEMPLATES } from '../constants';
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
    depth: 'Detailed'
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
    setLoadingText("Initializing Gemini 2.5 Flash...");

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
      const { content, imageUrl } = await generateContent(config, template);
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
      <div className="lg:col-span-1 bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700 overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
          <Lucide.Sliders size={20} className="text-violet-400" />
          Parameters
        </h2>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-3">Content Type</label>
          <div className="grid grid-cols-1 gap-3">
            {EDUCATIONAL_TEMPLATES.map((t) => {
              const TIcon = (Lucide as any)[t.icon];
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedTemplate.id === t.id 
                      ? 'bg-violet-600/20 border-violet-500 text-white' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedTemplate.id === t.id ? 'bg-violet-600' : 'bg-zinc-700'}`}>
                    <TIcon size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
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
            <label className="block text-sm font-medium text-zinc-400 mb-1">Topic / Subject <span className="text-red-400">*</span></label>
            <textarea 
              value={formData.topic}
              onChange={(e) => {
                setFormData({...formData, topic: e.target.value});
                if (error) setError(null); // Clear error on user input
              }}
              placeholder="e.g. The French Revolution, Quadratic Equations..."
              className={`w-full bg-zinc-900 border rounded-lg p-3 text-white focus:ring-2 focus:outline-none min-h-[80px] transition-colors ${
                error && !formData.topic.trim() 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-zinc-700 focus:ring-violet-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Target Audience (Grade)</label>
            <select 
              value={formData.gradeLevel}
              onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
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
              <label className="block text-sm font-medium text-zinc-400 mb-1">Tone</label>
              <select 
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option>Professional</option>
                <option>Encouraging</option>
                <option>Strict/Academic</option>
                <option>Humorous</option>
                <option>Socratic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Depth</label>
              <select 
                value={formData.depth}
                onChange={(e) => setFormData({...formData, depth: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
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
          <div className="w-full mt-8 bg-zinc-900 rounded-xl border border-violet-500/30 p-4 relative overflow-hidden shadow-lg shadow-violet-900/10">
            {/* Background Fill Animation */}
            <div 
              className="absolute top-0 left-0 bottom-0 bg-violet-600/10 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-violet-300 font-bold text-lg">
                 <Lucide.Loader2 className="animate-spin" size={20} /> 
                 {Math.round(progress)}%
              </div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider animate-pulse">
                {loadingText}
              </div>
            </div>

            {/* Bottom Progress Line */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-900/20`}
          >
            <Lucide.Sparkles /> Generate Content
          </button>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm flex items-start gap-2 animate-fade-in">
            <Lucide.AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Preview / Placeholder Area */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center bg-zinc-800/20 rounded-2xl border-2 border-dashed border-zinc-700/50 p-12 text-zinc-500 min-h-[400px]">
        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
          <IconComponent size={40} className="opacity-50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Ready to Create</h3>
        <p className="max-w-md text-center">
          Configure your parameters on the left and hit Generate. 
          ScholarCraft will formulate your {selectedTemplate.name.toLowerCase()} instantly.
        </p>
      </div>
    </div>
  );
};

export default Generator;