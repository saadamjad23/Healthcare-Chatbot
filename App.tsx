
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, MessageAuthor } from './types';
import { createChatSession } from './services/geminiService';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatMessageComponent from './components/ChatMessage';
import { BotIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const chatSession = createChatSession();
        if (!chatSession) {
          setError("Failed to initialize AI. Please check if the API key is configured correctly.");
          setIsLoading(false);
          return;
        }
        setChat(chatSession);

        // Send an initial empty message to get the welcome message
        const response = await chatSession.sendMessageStream({ message: "Hello" });
        
        let botResponse = '';
        setMessages([{ author: MessageAuthor.BOT, text: '...' }]);

        for await (const chunk of response) {
          botResponse += chunk.text;
          setMessages([{ author: MessageAuthor.BOT, text: botResponse + '...' }]);
        }
        setMessages([{ author: MessageAuthor.BOT, text: botResponse }]);

      } catch (err) {
        console.error("Initialization error:", err);
        setError("An error occurred while starting the chat session. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (userInput: string) => {
    if (!chat || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: userInput };
    const updatedMessages = [...messages, userMessage, { author: MessageAuthor.BOT, text: '' }];
    setMessages(updatedMessages);

    try {
      const responseStream = await chat.sendMessageStream({ message: userInput });
      let botResponseText = '';
      
      for await (const chunk of responseStream) {
        botResponseText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { author: MessageAuthor.BOT, text: botResponseText + '...' };
          return newMessages;
        });
      }

      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { author: MessageAuthor.BOT, text: botResponseText };
          return newMessages;
        });

    } catch (err) {
      console.error("Message sending error:", err);
      const errorMessage = "Sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev.slice(0, -1), { author: MessageAuthor.BOT, text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-4 my-4 animate-fade-in">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500 text-white">
            <BotIcon className="w-6 h-6" />
        </div>
        <div className="relative px-4 py-3 rounded-2xl max-w-lg shadow-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none flex items-center space-x-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto pt-20 pb-28">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <ChatMessageComponent key={index} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.author === MessageAuthor.USER && <TypingIndicator />}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
