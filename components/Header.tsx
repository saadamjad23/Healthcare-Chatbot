
import React from 'react';
import { SparklesIcon } from './IconComponents';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center">
        <SparklesIcon className="w-6 h-6 text-cyan-500 mr-3" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Gemini Healthcare Assistant
        </h1>
      </div>
    </header>
  );
};

export default Header;
