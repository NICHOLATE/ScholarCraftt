import React, { useEffect, useState } from 'react';
import { BookOpen, Brain, Sparkles, GraduationCap, Layout } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 3500); // Display time

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center transition-opacity duration-700 ${exiting ? 'opacity-0' : 'opacity-100'}`}>
      
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 mb-4">
          ScholarCraft
        </h1>
        <p className="text-zinc-400 text-lg tracking-widest uppercase">Intelligent Education Architecture</p>
      </div>

      {/* The "Nice Containers" Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl px-6 w-full animate-slide-up">
        
        {/* Container 1: Marketing/Creative */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/80 transition-all duration-500 group flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-violet-900/30 flex items-center justify-center mb-4 text-violet-400 group-hover:scale-110 transition-transform">
            <Brain size={24} />
          </div>
          <h3 className="font-semibold text-zinc-200">AI Logic</h3>
          <p className="text-xs text-zinc-500 mt-2">Powered by Gemini 2.5 Flash</p>
        </div>

        {/* Container 2: Education Focus */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/80 transition-all duration-500 delay-100 group flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-fuchsia-900/30 flex items-center justify-center mb-4 text-fuchsia-400 group-hover:scale-110 transition-transform">
            <GraduationCap size={24} />
          </div>
          <h3 className="font-semibold text-zinc-200">Pedagogy</h3>
          <p className="text-xs text-zinc-500 mt-2">Tailored for Educators</p>
        </div>

        {/* Container 3: Output Quality */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/80 transition-all duration-500 delay-200 group flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
            <Layout size={24} />
          </div>
          <h3 className="font-semibold text-zinc-200">Structure</h3>
          <p className="text-xs text-zinc-500 mt-2">Formatted Markdown</p>
        </div>

        {/* Container 4: Speed */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/80 transition-all duration-500 delay-300 group flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-900/30 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
            <Sparkles size={24} />
          </div>
          <h3 className="font-semibold text-zinc-200">Creativity</h3>
          <p className="text-xs text-zinc-500 mt-2">Limitless Generation</p>
        </div>

      </div>

      <div className="absolute bottom-10 text-zinc-600 text-xs tracking-widest animate-pulse">
        CAPACITI IS A DIVISION OF FUTURE EDUCATION
      </div>
    </div>
  );
};

export default SplashScreen;