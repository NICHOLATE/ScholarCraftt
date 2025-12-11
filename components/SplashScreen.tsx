import React, { useEffect, useState } from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 2500); // Reduced display time since there is less to read

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center transition-opacity duration-700 ${exiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Logo Mark */}
      <div className="mb-10 relative animate-bounce-slow">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-60 scale-150"></div>
        <div className="relative w-32 h-32 bg-white rounded-3xl shadow-2xl shadow-indigo-200 border border-slate-100 flex items-center justify-center">
             <GraduationCap size={64} className="text-indigo-600" />
             <div className="absolute -top-3 -right-3 bg-gradient-to-br from-indigo-500 to-blue-500 text-white p-2 rounded-full shadow-lg border-4 border-white">
                <Sparkles size={24} />
             </div>
        </div>
      </div>

      <div className="text-center animate-fade-in relative z-10 px-4">
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
          ScholarCraft
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-500 to-blue-400 mx-auto rounded-full mb-8"></div>
        <p className="text-slate-500 text-xl md:text-2xl font-light tracking-widest uppercase">
          Intelligent Education Architecture
        </p>
      </div>

    </div>
  );
};

export default SplashScreen;