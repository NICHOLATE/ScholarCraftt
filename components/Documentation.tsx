import React, { useState } from 'react';
import { TECHNICAL_DOCS, SAMPLE_OUTPUTS, EDUCATIONAL_TEMPLATES } from '../constants';
import { Book, Code, Layers, ShieldCheck, Cpu } from 'lucide-react';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('specs');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden max-w-6xl mx-auto w-full shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'specs' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu size={16} /> Technical Specs
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'prompts' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} /> Prompt Library
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'samples' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Book size={16} /> Sample Outputs
        </button>
      </div>

      {/* Content */}
      <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
        
        {activeTab === 'specs' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            {TECHNICAL_DOCS.map((doc, idx) => (
              <section key={idx}>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 border-l-4 border-indigo-600 pl-4">
                  {doc.title}
                </h3>
                <div className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200">
                  {doc.content}
                </div>
              </section>
            ))}
            
            <section className="mt-8 pt-8 border-t border-slate-200">
               <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <ShieldCheck className="text-emerald-600"/> Limitation Management
               </h3>
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 space-y-2">
                 <p><strong>Rate Limits:</strong> Implemented exponential backoff for 429 errors.</p>
                 <p><strong>Context Window:</strong> Inputs truncated if exceeding 30k tokens (though uncommon in this use case).</p>
                 <p><strong>Hallucination:</strong> User warnings added to "Study Guides" reminding students to verify facts.</p>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="grid gap-6 animate-fade-in">
            <p className="text-slate-500 mb-4">
              Below is the prompt library used by ScholarCraft. These templates utilize variable injection (`${'{variable}'}`) to customize the output.
            </p>
            {EDUCATIONAL_TEMPLATES.map((tmpl) => (
              <div key={tmpl.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                     <Code size={20} />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900">{tmpl.name}</h4>
                     <p className="text-xs text-slate-500">{tmpl.category}</p>
                   </div>
                </div>
                <pre className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600 font-mono overflow-x-auto whitespace-pre-wrap border border-slate-200">
                  {tmpl.promptTemplate('{TOPIC}', '{GRADE}', '{TONE}', '{DEPTH}').trim()}
                </pre>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SAMPLE_OUTPUTS.map((sample, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h4 className="font-bold text-slate-900">{sample.title}</h4>
                      <p className="text-xs text-slate-500">{sample.desc}</p>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {sample.snippet}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-100 text-center text-xs text-slate-400 font-mono uppercase tracking-wider">
                      AI Generated Output
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;