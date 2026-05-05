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
  
  // Destructure the new pager state
  const { history, cwd, handleKeyDown, pager } = useTerminal();

  useEffect(() => {
    if (containerRef.current && !pager) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, input, pager]);

  const focusInput = () => inputRef.current?.focus();
  useEffect(() => focusInput(), [pager]); // Re-focus when switching modes

  return (
    <div 
      className="min-h-screen bg-[#1e1e1e] text-gray-200 font-mono p-4 sm:p-8 cursor-text"
      onClick={focusInput}
    >
      <div className="max-w-4xl mx-auto h-[90vh] overflow-y-auto custom-scrollbar" ref={containerRef}>
        
        {/* Only show welcome message and history if pager is NOT active */}
        {!pager && (
          <>
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
                  entry.output.isHTML ? (
                    <div className={`mt-1 whitespace-pre-wrap ${entry.output.isError ? 'text-red-400' : ''}`} dangerouslySetInnerHTML={{ __html: entry.output.text }} />
                  ) : (
                    <div className={`mt-1 whitespace-pre-wrap ${entry.output.isError ? 'text-red-400' : ''}`}>
                      {entry.output.text}
                    </div>
                  )
                )}
              </div>
            ))}
          </>
        )}

        {pager && (
          <div className="h-full flex flex-col">
            <div className="whitespace-pre-wrap flex-1 overflow-hidden">
              {pager.isHTML ? (
                <div dangerouslySetInnerHTML={{ __html: pager.content.slice(pager.index, pager.index + 24).join('\n') }} />
              ) : (
                pager.content.slice(pager.index, pager.index + 24).join('\n')
              )}
            </div>
            <div className="mt-2 bg-gray-800 text-white inline-block px-2 py-1 w-fit">
              {pager.index >= pager.content.length - 24 
                ? '(END) - Press q to quit' 
                : ': (Press Enter to scroll, Space for next page, q to quit)'}
            </div>
            <input
              ref={inputRef}
              type="text"
              className="opacity-0 absolute w-0 h-0"
              onKeyDown={(e) => handleKeyDown(e, input, setInput)}
            />
          </div>
        )}

        {/* --- NORMAL TERMINAL PROMPT --- */}
        {!pager && (
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
        )}

      </div>
    </div>
  );
}