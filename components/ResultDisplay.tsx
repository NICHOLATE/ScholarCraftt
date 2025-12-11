import React, { useState, useEffect, useCallback } from 'react';
import { GenerationResult, QuizQuestion } from '../types';
import { Copy, Download, Clock, Zap, RotateCcw, Image as ImageIcon, BookOpen, CheckCircle2, XCircle, ChevronRight, Trophy, FileText, Activity, Coins, AlertCircle } from 'lucide-react';

interface ResultDisplayProps {
  result: GenerationResult;
  onReset: () => void;
}

interface QuizPlayerProps { 
  questions: QuizQuestion[];
  onStatsUpdate?: (score: number, complete: boolean) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ questions, onStatsUpdate }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Sync stats with parent
  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(score, showResults);
    }
  }, [score, showResults, onStatsUpdate]);

  // Safety check: Ensure questions exist
  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        <p>No valid quiz questions generated.</p>
      </div>
    );
  }

  // Safety check: Ensure current question index is valid
  const question = questions[currentIdx];
  if (!question && !showResults) {
    return <div className="p-4 text-red-500">Error: Question data missing.</div>;
  }

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    
    // Track user answer
    setUserAnswers(prev => ({...prev, [currentIdx]: option}));

    if (option === question.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers({});
    setScore(0);
    setShowResults(false);
  };

  const getPerformanceMetrics = () => {
    const percentage = Math.round((score / questions.length) * 100);
    let label = 'Needs Practice';
    let color = 'text-red-600';
    let bg = 'bg-red-50 border-red-100';
    
    if (percentage >= 90) { label = 'Mastery Achieved'; color = 'text-emerald-600'; bg = 'bg-emerald-50 border-emerald-100'; }
    else if (percentage >= 75) { label = 'Proficient'; color = 'text-indigo-600'; bg = 'bg-indigo-50 border-indigo-100'; }
    else if (percentage >= 60) { label = 'Developing'; color = 'text-amber-600'; bg = 'bg-amber-50 border-amber-100'; }

    return { percentage, label, color, bg };
  };

  if (showResults) {
    const { percentage, label, color, bg } = getPerformanceMetrics();

    return (
      <div className="flex flex-col h-full animate-fade-in max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mb-8 shadow-lg">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${bg} ${color}`}>
            <Trophy size={48} />
          </div>
          <h3 className={`text-5xl font-bold mb-2 ${color}`}>{percentage}%</h3>
          <p className="text-xl text-slate-800 font-bold mb-1">{label}</p>
          <p className="text-slate-500">You answered {score} out of {questions.length} questions correctly.</p>
          
          <button 
            onClick={handleRetry}
            className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto shadow-lg shadow-indigo-200"
          >
            <RotateCcw size={18} /> Retry Quiz
          </button>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4 pb-8">
          <h4 className="text-slate-500 font-bold uppercase tracking-wider text-sm px-2 flex items-center gap-2">
            <Activity size={16} /> Performance Analysis
          </h4>
          {questions.map((q, idx) => {
            const userAnswer = userAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <div key={idx} className={`p-5 rounded-xl border ${isCorrect ? 'bg-white border-slate-200 shadow-sm' : 'bg-red-50 border-red-100'}`}>
                <div className="flex gap-3 mb-3">
                  <div className={`mt-1 shrink-0 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <h5 className="text-slate-800 font-medium leading-relaxed">
                        <span className="text-slate-400 mr-2">{idx + 1}.</span>
                        {q.question}
                    </h5>
                  </div>
                </div>

                <div className="pl-8 space-y-2 text-sm">
                   <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-24">Your Answer:</span>
                      <span className={`font-medium ${isCorrect ? 'text-emerald-600' : 'text-red-500 line-through'}`}>
                        {userAnswer || "Skipped"}
                      </span>
                   </div>
                   {!isCorrect && (
                     <div className="flex items-center gap-2">
                        <span className="text-slate-500 w-24">Correct Answer:</span>
                        <span className="text-emerald-600 font-medium">{q.correctAnswer}</span>
                     </div>
                   )}
                   <div className="mt-3 pt-3 border-t border-slate-200/60 text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                     <span className="font-bold text-slate-700 block mb-1">Explanation:</span>
                     {q.explanation}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 h-full flex flex-col justify-center">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6 text-sm text-slate-500 font-medium">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span>Current Score: {score}</span>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
        <h3 className="text-xl font-bold text-slate-900 mb-6 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let stateClass = "border-slate-200 hover:border-indigo-400 hover:bg-slate-50";
            let icon = null;

            if (isAnswered) {
              if (option === question.correctAnswer) {
                stateClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                icon = <CheckCircle2 size={20} className="text-emerald-600" />;
              } else if (option === selectedOption) {
                stateClass = "border-red-400 bg-red-50 text-red-800";
                icon = <XCircle size={20} className="text-red-600" />;
              } else {
                stateClass = "border-slate-100 text-slate-400 opacity-60";
              }
            } else if (selectedOption === option) {
               stateClass = "border-indigo-500 bg-indigo-50 text-indigo-900";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${stateClass}`}
              >
                <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                        isAnswered && option === question.correctAnswer ? 'border-emerald-500 text-emerald-600' : 'border-slate-300 text-slate-500'
                    }`}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{option}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="mt-1 text-indigo-600">
                    <Zap size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 mb-1 text-sm">Explanation</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{question.explanation}</p>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end mt-auto pb-4">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isAnswered 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 translate-y-0 opacity-100' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed translate-y-2 opacity-0'
          }`}
        >
          {currentIdx === questions.length - 1 ? 'Show Results' : 'Next Question'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  // Initialize view mode based on content type
  const [viewMode, setViewMode] = useState<'content' | 'quiz'>(
    result.quizData && result.quizData.length > 0 ? 'quiz' : 'content'
  );
  
  const [isExporting, setIsExporting] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [quizStats, setQuizStats] = useState<{score: number, complete: boolean}>({score: 0, complete: false});

  // Handle updates from quiz player
  const handleQuizUpdate = useCallback((score: number, complete: boolean) => {
    setQuizStats(prev => {
        // Prevent state update if values are identical to avoid unnecessary renders
        if (prev.score === score && prev.complete === complete) return prev;
        return { score, complete };
    });
  }, []);

  // React to changes in the result object to auto-switch views
  useEffect(() => {
    if (result.quizData && result.quizData.length > 0) {
      setViewMode('quiz');
    } else {
      setViewMode('content');
    }
  }, [result.id, result.quizData]);
  
  // Cost Calculation for Gemini 2.5 Flash
  const estimateCost = () => {
    // Safety checks for result object structure
    if (!result?.config?.topic) return "N/A";

    const inputEstimate = (result.config.topic.length + 500) / 4; 
    const outputEstimate = result.estimatedTokens || 0;
    
    const inputCost = (inputEstimate / 1000000) * 0.075;
    const outputCost = (outputEstimate / 1000000) * 0.30;
    
    const total = inputCost + outputCost;
    return total < 0.0001 ? "< $0.0001" : `$${total.toFixed(5)}`;
  };

  const handleCopy = () => {
    if (result.content) {
      navigator.clipboard.writeText(result.content);
      alert('Markdown copied to clipboard!');
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Safely access global libraries
      const marked = (window as any).marked;
      const html2pdf = (window as any).html2pdf;
      
      if (!marked || !html2pdf) {
        alert("Export libraries (marked/html2pdf) are not loaded.");
        setIsExporting(false);
        return;
      }

      // Ensure marked.parse is available
      if (typeof marked.parse !== 'function') {
         alert("Markdown parser configuration error.");
         setIsExporting(false);
         return;
      }

      const htmlContent = marked.parse(result.content);
      
      const element = document.createElement('div');
      element.style.fontFamily = "'Inter', sans-serif";
      element.style.color = '#1a202c'; 
      element.style.background = '#ffffff';
      element.style.padding = '40px';
      
      let quizScoreHtml = '';
      if (viewMode === 'quiz' && result.quizData) {
         const percentage = Math.round((quizStats.score / result.quizData.length) * 100);
         const statusColor = percentage >= 70 ? '#10b981' : '#f59e0b';
         
         quizScoreHtml = `
           <div style="margin-bottom: 30px; padding: 20px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
             <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Result Report</h2>
             <div style="display: flex; align-items: baseline; gap: 15px;">
                <span style="font-size: 32px; font-weight: bold; color: ${statusColor};">${percentage}%</span>
                <span style="font-size: 16px; color: #64748b;">(${quizStats.score} / ${result.quizData.length} Correct)</span>
             </div>
             <p style="margin: 5px 0 0; font-size: 12px; color: #94a3b8;">
               Status: ${quizStats.complete ? 'Completed' : 'In Progress'}
             </p>
           </div>
         `;
      }

      element.innerHTML = `
        <div style="margin-bottom: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 24px; color: #1e293b;">${result.config.topic}</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            ${result.config.gradeLevel} • ${result.config.tone} • ScholarCraft AI
          </p>
        </div>
        
        ${quizScoreHtml}

        ${result.imageUrl ? `
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${result.imageUrl}" style="max-height: 300px; max-width: 100%; border-radius: 8px;" />
          </div>
        ` : ''}
        
        <div class="pdf-content" style="font-size: 14px; line-height: 1.6;">
          ${htmlContent}
        </div>
        
        <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          Generated by ScholarCraft AI
        </div>
      `;

      const opt = {
        margin: [0.5, 0.5],
        filename: `ScholarCraft-${result.config.topic.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

    } catch (e) {
      console.error("PDF Export failed", e);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    // Safely check for marked library presence and compatibility
    const marked = (window as any).marked;
    
    // Check if marked is available and has the parse method (v4+)
    if (marked && typeof marked.parse === 'function') {
      try {
        const html = marked.parse(result.content);
        return (
          // REMOVED prose-invert so it uses default dark text colors
          <div 
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-a:text-indigo-600 prose-code:bg-slate-100 prose-code:text-indigo-600 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (e) {
        console.error("Markdown parsing failed:", e);
        // Fallthrough to raw text on error
      }
    }
    
    // Fallback
    return <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">{result.content}</div>;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header / Meta Bar */}
      <div className="bg-white border-b border-slate-200 p-4 rounded-t-2xl flex flex-wrap gap-4 justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
            <button 
                onClick={onReset} 
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                title="New Generation"
            >
                <RotateCcw size={20} />
            </button>
            <div>
                <h3 className="font-bold text-slate-900 text-lg">{result.config.topic}</h3>
                <p className="text-xs text-slate-500 font-medium">{result.config.gradeLevel} • {result.config.tone}</p>
            </div>
        </div>

        {/* View Toggle for Quiz */}
        {result.quizData && result.quizData.length > 0 && (
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('content')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                viewMode === 'content' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} /> Document
            </button>
            <button
              onClick={() => setViewMode('quiz')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                viewMode === 'quiz' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 size={14} /> Interactive Quiz
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 hidden lg:flex">
             {/* Stats & Costs Group */}
            <div 
              className="flex bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 gap-4 relative cursor-help"
              onMouseEnter={() => setShowCostDetails(true)}
              onMouseLeave={() => setShowCostDetails(false)}
            >
               <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-500" />
                  <span>{result.durationMs}ms</span>
               </div>
               <div className="w-px h-4 bg-slate-300"></div>
               <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  <span>{result.estimatedTokens} toks</span>
               </div>
               <div className="w-px h-4 bg-slate-300"></div>
               <div className="flex items-center gap-1.5">
                  <Coins size={14} className="text-emerald-500" />
                  <span>{estimateCost()}</span>
               </div>

               {/* Tooltip for Rate Limits */}
               {showCostDetails && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-fade-in">
                    <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Activity size={14} className="text-indigo-500"/> Rate Limits
                    </h5>
                    <div className="space-y-1 text-slate-500">
                      <div className="flex justify-between">
                        <span>RPM Consumed:</span>
                        <span className="text-slate-800 font-medium">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flash Tier:</span>
                        <span className="text-slate-800 font-medium">Pay-as-you-go</span>
                      </div>
                      <div className="flex justify-between">
                         <span>Limit Status:</span>
                         <span className="text-emerald-600 font-bold">Optimal</span>
                      </div>
                      <hr className="border-slate-100 my-2" />
                      <div className="text-[10px] text-slate-400 leading-tight">
                        Costs based on Gemini 2.5 Flash pricing ($0.30/1M output tokens).
                      </div>
                    </div>
                 </div>
               )}
            </div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm rounded-lg transition-colors"
            >
                <Copy size={16} /> Copy
            </button>
            <button 
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
            >
                {isExporting ? <RotateCcw className="animate-spin" size={16} /> : <Download size={16} />} 
                {isExporting ? 'Saving...' : 'PDF'}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-b-2xl border border-t-0 border-slate-200 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Display Generated Image if Available */}
          {result.imageUrl && viewMode === 'content' && (
            <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white shrink-0">
              <img 
                src={result.imageUrl} 
                alt={`Illustration for ${result.config.topic}`}
                className="w-full h-auto max-h-[350px] object-contain bg-slate-50"
              />
            </div>
          )}

          {viewMode === 'content' ? (
            <article className="min-h-0">
                {renderContent()}
            </article>
          ) : (
            <div className="flex-1 flex flex-col">
              {result.quizData && (
                <QuizPlayer 
                  key={result.id} 
                  questions={result.quizData} 
                  onStatsUpdate={handleQuizUpdate} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;