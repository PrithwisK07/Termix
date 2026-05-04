'use client';

import { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';

const Prompt = ({ path }: { path: string }) => (
  <span className="flex gap-2 font-mono">
    <span className="text-green-400 font-bold">user@portfolio</span>
    <span className="text-white">:</span>
    <span className="text-blue-400 font-bold">{path.replace('/home/user', '~')}</span>
    <span className="text-white">$</span>
  </span>
);

export default function TerminalUI() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { history, cwd, handleKeyDown } = useTerminal();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, input]);

  const focusInput = () => inputRef.current?.focus();
  useEffect(() => focusInput(), []);

  return (
    <div 
      className="min-h-screen bg-[#1e1e1e] text-gray-200 font-mono p-4 sm:p-8 cursor-text"
      onClick={focusInput}
    >
      <div className="max-w-4xl mx-auto h-[90vh] overflow-y-auto custom-scrollbar" ref={containerRef}>
        
        <div className="mb-4">
          <p>Welcome to my interactive portfolio.</p>
          <p className="text-gray-400">Type <span className="text-yellow-300">help</span> to see available commands.</p>
        </div>

        {history.map((entry, idx) => (
          <div key={idx} className="mb-2">
            <div className="flex gap-2">
              <Prompt path={entry.cwd} />
              <span>{entry.command}</span>
            </div>
            
            {entry.output && (
              <>
                {/* NEW: Render injected React Component if it exists (for top, matrix, etc.) */}
                {entry.output.component && (
                  <div className="mt-2">
                    {entry.output.component}
                  </div>
                )}

                {/* EXISTING: Render Standard Text/HTML */}
                {entry.output.text && (
                  entry.output.isHTML ? (
                    <div 
                      className={`mt-1 whitespace-pre-wrap ${entry.output.isError ? 'text-red-400' : ''}`}
                      dangerouslySetInnerHTML={{ __html: entry.output.text }}
                    />
                  ) : (
                    <div className={`mt-1 whitespace-pre-wrap ${entry.output.isError ? 'text-red-400' : ''}`}>
                      {entry.output.text}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex gap-2 items-center mt-2">
          <Prompt path={cwd} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none border-none text-gray-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, input, setInput)}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}