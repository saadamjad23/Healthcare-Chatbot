
import React from 'react';
import { MessageAuthor, ChatMessage as ChatMessageType } from '../types';
import { BotIcon, UserIcon } from './IconComponents';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.author === MessageAuthor.BOT;

  const textWithLineBreaks = message.text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div
      className={`flex items-start gap-4 my-4 animate-fade-in ${
        isBot ? '' : 'flex-row-reverse'
      }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isBot ? 'bg-cyan-500 text-white' : 'bg-slate-300 text-slate-700'
        }`}
      >
        {isBot ? <BotIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
      </div>
      <div
        className={`relative px-4 py-3 rounded-2xl max-w-lg shadow-sm ${
          isBot
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
            : 'bg-cyan-500 text-white rounded-tr-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{textWithLineBreaks}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
