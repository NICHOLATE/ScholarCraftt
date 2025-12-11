import React from 'react';
import { EDUCATIONAL_TEMPLATES, SAMPLE_OUTPUTS } from '../constants';
import * as Lucide from 'lucide-react';
import { Sparkles, Play, ArrowRight } from 'lucide-react';

interface TemplatesViewProps {
  onRunTemplate: (templateId: string, topic: string) => void;
}

const ExamplesView: React.FC<TemplatesViewProps> = ({ onRunTemplate }) => {
  return (
    <div className="h-full flex flex-col animate-fade-in max-w-6xl mx-auto w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Templates</h2>
        <p className="text-slate-500">Select a template below to automatically generate an illustrative example.</p>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
        {EDUCATIONAL_TEMPLATES.map((template) => {
          const sample = SAMPLE_OUTPUTS.find(s => s.id === template.id);
          const IconName = template.icon;
          const Icon = (Lucide as any)[IconName] || Lucide.FileText;

          return (
            <div 
              key={template.id} 
              onClick={() => onRunTemplate(template.id, template.sampleTopic)}
              className="group bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
            >
              
              {/* Left Column: Description */}
              <div className="lg:w-1/3 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{template.name}</h3>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {template.category}
                    </span>
                  </div>
                </div>

                <div className="text-slate-600 text-sm leading-relaxed">
                  <p className="mb-3">{template.description}</p>
                  <p className="text-slate-500 italic border-l-2 border-slate-300 pl-3">
                    "Great for {template.category === 'Planning' ? 'teachers organizing curriculum' : template.category === 'Assessment' ? 'checking student understanding' : 'engaging students directly'}."
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-2 text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                   <Play size={16} fill="currentColor" /> Generate Example
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="lg:w-2/3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm group-hover:shadow-md transition-shadow">
                <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-500" /> Output Preview
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  </div>
                </div>
                
                <div className="p-5 font-mono text-xs md:text-sm text-slate-600 whitespace-pre-wrap leading-relaxed opacity-90">
                  {sample ? sample.snippet : "Preview not available."}
                </div>

                <div className="bg-gradient-to-t from-slate-50 to-transparent h-12 -mt-12 relative z-10"></div>
              </div>

            </div>
          );
        })}
        
      </div>
    </div>
  );
};

export default ExamplesView;