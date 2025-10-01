
import React, { useState } from 'react';
import { SendIcon } from './IconComponents';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-4 fixed bottom-0 left-0 right-0">
      <div className="container mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a health question..."
            disabled={isLoading}
            className="flex-grow bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 text-slate-800 dark:text-slate-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-cyan-500 text-white rounded-full p-3 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Send message"
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <SendIcon className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
