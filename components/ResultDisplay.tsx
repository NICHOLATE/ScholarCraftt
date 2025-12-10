import React, { useState } from 'react';
import { GenerationResult, QuizQuestion } from '../types';
import { Copy, Download, Clock, Zap, RotateCcw, Image as ImageIcon, BookOpen, CheckCircle2, XCircle, ChevronRight, Trophy, FileText, Activity, Coins } from 'lucide-react';

interface ResultDisplayProps {
  result: GenerationResult;
  onReset: () => void;
}

const QuizPlayer: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentIdx];

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
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
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-zinc-800/50 rounded-xl p-8 border border-zinc-700 animate-fade-in text-center">
        <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mb-6">
          <Trophy size={40} />
        </div>
        <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
        <p className="text-zinc-400 mb-6">You scored {score} out of {questions.length}</p>
        
        <div className="w-full max-w-xs bg-zinc-700 h-4 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
            style={{ width: `${(score / questions.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={handleRetry}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} /> Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6 text-sm text-zinc-400 font-medium">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="w-full bg-zinc-800 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-violet-500 transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
        <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let stateClass = "border-zinc-600 hover:border-violet-500 hover:bg-zinc-700/50";
            if (isAnswered) {
              if (option === question.correctAnswer) {
                stateClass = "border-green-500 bg-green-500/20 text-green-200";
              } else if (option === selectedOption) {
                stateClass = "border-red-500 bg-red-500/20 text-red-200";
              } else {
                stateClass = "border-zinc-700 opacity-50";
              }
            } else if (selectedOption === option) {
               stateClass = "border-violet-500 bg-violet-500/20";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${stateClass}`}
              >
                <span className="font-medium">{option}</span>
                {isAnswered && option === question.correctAnswer && <CheckCircle2 size={20} className="text-green-500" />}
                {isAnswered && option === selectedOption && option !== question.correctAnswer && <XCircle size={20} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-zinc-700/50 animate-fade-in">
            <h4 className="font-bold text-zinc-300 mb-1">Explanation:</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isAnswered 
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20 translate-y-0' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed translate-y-2 opacity-0'
          }`}
        >
          {currentIdx === questions.length - 1 ? 'See Results' : 'Next Question'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const [viewMode, setViewMode] = useState<'content' | 'quiz'>('content');
  const [isExporting, setIsExporting] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);
  
  // Cost Calculation for Gemini 2.5 Flash
  // Input: $0.075 / 1 million tokens
  // Output: $0.30 / 1 million tokens
  const estimateCost = () => {
    const inputEstimate = (result.config.topic.length + 500) / 4; // Crude input est
    const outputEstimate = result.estimatedTokens;
    
    const inputCost = (inputEstimate / 1000000) * 0.075;
    const outputCost = (outputEstimate / 1000000) * 0.30;
    
    const total = inputCost + outputCost;
    return total < 0.0001 ? "< $0.0001" : `$${total.toFixed(5)}`;
  };

  const handleCopy = () => {
    // When copying, we want the raw markdown for flexibility
    navigator.clipboard.writeText(result.content);
    alert('Markdown copied to clipboard!');
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Parse markdown to HTML using global 'marked'
      const marked = (window as any).marked;
      const html2pdf = (window as any).html2pdf;
      
      if (!marked || !html2pdf) {
        alert("Export libraries not loaded. Please refresh.");
        return;
      }

      const htmlContent = marked.parse(result.content);
      
      // Create a clean container for PDF generation
      const element = document.createElement('div');
      element.style.fontFamily = "'Inter', sans-serif";
      element.style.color = '#1a202c'; // Text Slate-900 equivalent
      element.style.background = '#ffffff';
      element.style.padding = '40px';
      
      // Construct PDF Content
      element.innerHTML = `
        <div style="margin-bottom: 20px; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 24px; color: #1e293b;">${result.config.topic}</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            ${result.config.gradeLevel} • ${result.config.tone} • ScholarCraft AI
          </p>
        </div>
        
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
    const marked = (window as any).marked;
    if (marked) {
      const html = marked.parse(result.content);
      return (
        <div 
          className="prose prose-invert prose-violet max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-200 prose-ul:text-zinc-300 prose-ol:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    // Fallback if marked is not loaded
    return <div className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed">{result.content}</div>;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header / Meta Bar */}
      <div className="bg-zinc-800 border-b border-zinc-700 p-4 rounded-t-2xl flex flex-wrap gap-4 justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
            <button 
                onClick={onReset} 
                className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="New Generation"
            >
                <RotateCcw size={20} />
            </button>
            <div>
                <h3 className="font-bold text-white text-lg">{result.config.topic}</h3>
                <p className="text-xs text-zinc-400">{result.config.gradeLevel} • {result.config.tone}</p>
            </div>
        </div>

        {/* View Toggle for Quiz */}
        {result.quizData && (
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-700">
            <button
              onClick={() => setViewMode('content')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                viewMode === 'content' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} /> Document
            </button>
            <button
              onClick={() => setViewMode('quiz')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                viewMode === 'quiz' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 size={14} /> Interactive Quiz
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 hidden lg:flex">
             {/* Stats & Costs Group */}
            <div 
              className="flex bg-zinc-900 rounded-lg border border-zinc-700 px-3 py-1.5 gap-4 relative cursor-help"
              onMouseEnter={() => setShowCostDetails(true)}
              onMouseLeave={() => setShowCostDetails(false)}
            >
               <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-violet-400" />
                  <span>{result.durationMs}ms</span>
               </div>
               <div className="w-px h-4 bg-zinc-700"></div>
               <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-400" />
                  <span>{result.estimatedTokens} toks</span>
               </div>
               <div className="w-px h-4 bg-zinc-700"></div>
               <div className="flex items-center gap-1.5">
                  <Coins size={14} className="text-emerald-400" />
                  <span>{estimateCost()}</span>
               </div>

               {/* Tooltip for Rate Limits */}
               {showCostDetails && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-800 border border-zinc-600 rounded-xl shadow-xl p-3 z-50 animate-fade-in">
                    <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Activity size={14} className="text-violet-400"/> Rate Limits
                    </h5>
                    <div className="space-y-1 text-zinc-400">
                      <div className="flex justify-between">
                        <span>RPM Consumed:</span>
                        <span className="text-white">1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flash Tier:</span>
                        <span className="text-white">Pay-as-you-go</span>
                      </div>
                      <div className="flex justify-between">
                         <span>Limit Status:</span>
                         <span className="text-emerald-400 font-bold">Optimal</span>
                      </div>
                      <hr className="border-zinc-700 my-2" />
                      <div className="text-[10px] text-zinc-500 leading-tight">
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
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm rounded-lg transition-colors"
            >
                <Copy size={16} /> Copy
            </button>
            <button 
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
            >
                {isExporting ? <RotateCcw className="animate-spin" size={16} /> : <Download size={16} />} 
                {isExporting ? 'Saving...' : 'PDF'}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-zinc-900 rounded-b-2xl border border-t-0 border-zinc-700 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Display Generated Image if Available */}
          {result.imageUrl && viewMode === 'content' && (
            <div className="mb-8 rounded-xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-950 shrink-0">
              <img 
                src={result.imageUrl} 
                alt={`Illustration for ${result.config.topic}`}
                className="w-full h-auto max-h-[350px] object-contain bg-zinc-950"
              />
            </div>
          )}

          {viewMode === 'content' ? (
            <article className="min-h-0">
                {renderContent()}
            </article>
          ) : (
            <div className="flex-1 flex flex-col">
              {result.quizData && <QuizPlayer questions={result.quizData} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;