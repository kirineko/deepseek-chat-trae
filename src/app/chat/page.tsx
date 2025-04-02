'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是你的计算机学习助教，可以帮你解答编程问题、算法设计、系统架构等计算机领域的问题。请告诉我你正在学习什么内容？',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // 调用DeepSeek API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, {
            role: 'user',
            content: inputValue
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const newAiMessage: Message = {
        id: Date.now().toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newAiMessage]);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = line.replace('data: ', '');
            try {
              const data = JSON.parse(eventData);
              if (data.content) {
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === 'assistant') {
                    const updatedMessage = {
                      ...lastMessage,
                      content: lastMessage.content + data.content
                    };
                    return [...prev.slice(0, -1), updatedMessage];
                  }
                  return prev;
                });
              }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      }
    }
  }} catch (error) {
    console.error('调用API出错:', error);
      const newAiMessage: Message = {
        id: Date.now().toString(),
        content: '抱歉，AI暂时无法响应，请稍后再试',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 lg:p-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full max-w-4xl mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">计算机学习助教</h1>
        <p className="text-gray-600 dark:text-gray-300">
          专业解答计算机科学问题，启发式教学帮助你深入理解
        </p>
      </header>

      <div className="w-full max-w-4xl flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-4 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>

      <footer className="w-full max-w-4xl mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>AI助手可能会产生不准确的信息，请谨慎验证重要内容</p>
        <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
          返回首页
        </Link>
      </footer>
    </div>
  );
}