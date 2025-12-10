import React, { useState } from 'react';
import { TECHNICAL_DOCS, SAMPLE_OUTPUTS, EDUCATIONAL_TEMPLATES } from '../constants';
import { Book, Code, Layers, ShieldCheck, Cpu } from 'lucide-react';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('specs');

  return (
    <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700 h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'specs' ? 'text-violet-400 border-b-2 border-violet-400 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu size={16} /> Technical Specs
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'prompts' ? 'text-violet-400 border-b-2 border-violet-400 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers size={16} /> Prompt Library
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'samples' ? 'text-violet-400 border-b-2 border-violet-400 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
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
                <h3 className="text-2xl font-serif font-bold text-white mb-4 border-l-4 border-violet-500 pl-4">
                  {doc.title}
                </h3>
                <div className="text-zinc-300 leading-relaxed bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                  {doc.content}
                </div>
              </section>
            ))}
            
            <section className="mt-8 pt-8 border-t border-zinc-700">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <ShieldCheck className="text-green-400"/> Limitation Management
               </h3>
               <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-zinc-300 space-y-2">
                 <p><strong>Rate Limits:</strong> Implemented exponential backoff for 429 errors.</p>
                 <p><strong>Context Window:</strong> Inputs truncated if exceeding 30k tokens (though uncommon in this use case).</p>
                 <p><strong>Hallucination:</strong> User warnings added to "Study Guides" reminding students to verify facts.</p>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="grid gap-6 animate-fade-in">
            <p className="text-zinc-400 mb-4">
              Below is the prompt library used by ScholarCraft. These templates utilize variable injection (`${'{variable}'}`) to customize the output.
            </p>
            {EDUCATIONAL_TEMPLATES.map((tmpl) => (
              <div key={tmpl.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-violet-900/30 rounded text-violet-400">
                     <Code size={20} />
                   </div>
                   <div>
                     <h4 className="font-bold text-white">{tmpl.name}</h4>
                     <p className="text-xs text-zinc-500">{tmpl.category}</p>
                   </div>
                </div>
                <pre className="bg-zinc-950 p-4 rounded-lg text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap border border-zinc-800">
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
                  <div key={idx} className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 bg-zinc-800 border-b border-zinc-700">
                      <h4 className="font-bold text-white">{sample.title}</h4>
                      <p className="text-xs text-zinc-400">{sample.desc}</p>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed opacity-80">
                        {sample.snippet}
                      </div>
                    </div>
                    <div className="p-2 bg-zinc-950 text-center text-xs text-zinc-600 font-mono uppercase tracking-wider">
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