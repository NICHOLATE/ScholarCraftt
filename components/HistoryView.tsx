import React from 'react';
import { GenerationResult } from '../types';
import { Trash2, Clock, ArrowRight, Calendar, Tag, GraduationCap, Image as ImageIcon } from 'lucide-react';
import { EDUCATIONAL_TEMPLATES } from '../constants';
import * as Lucide from 'lucide-react';

interface HistoryViewProps {
  history: GenerationResult[];
  onSelect: (result: GenerationResult) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-fade-in">
        <Clock size={48} className="mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-zinc-400">No History Yet</h3>
        <p className="mt-2">Generated content will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">History</h2>
        <p className="text-zinc-400">View and manage your previously generated content.</p>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {history.slice().reverse().map((item) => {
            const template = EDUCATIONAL_TEMPLATES.find(t => t.id === item.config.templateId);
            const IconName = template?.icon || 'FileText';
            const Icon = (Lucide as any)[IconName] || Lucide.FileText;
            const date = new Date(item.timestamp);

            return (
                <div 
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="group bg-zinc-800/50 border border-zinc-700 hover:border-violet-500/50 hover:bg-zinc-800 p-4 rounded-xl transition-all cursor-pointer flex gap-4 relative overflow-hidden"
                >
                    {/* Thumbnail or Icon */}
                    <div className="shrink-0">
                      {item.imageUrl ? (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
                           <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-violet-400">
                          <Icon size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-zinc-200 truncate group-hover:text-violet-300 transition-colors text-lg">
                            {item.config.topic}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
                            <span className="flex items-center gap-1 bg-zinc-900/50 px-2 py-1 rounded">
                                <Tag size={12} /> {template?.name || 'Content'}
                            </span>
                            <span className="flex items-center gap-1 bg-zinc-900/50 px-2 py-1 rounded">
                                <GraduationCap size={12} /> {item.config.gradeLevel}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-3">
                            <span className="flex items-center gap-1">
                                <Calendar size={12} /> {date.toLocaleDateString()}
                            </span>
                             {item.imageUrl && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <ImageIcon size={12} /> Image
                              </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 pl-2 border-l border-zinc-700/50 ml-2">
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(item);
                            }}
                            className="p-2 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600 hover:text-white transition-colors"
                            title="View"
                        >
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={(e) => onDelete(item.id, e)}
                            className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default HistoryView;