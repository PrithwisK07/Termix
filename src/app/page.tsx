'use client';
import { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';

// --- TERMINAL PROMPT COMPONENT ---
const Prompt = ({ path }: { path: string }) => (
  <span className="flex gap-2 font-mono">
    <span className="text-green-400 font-bold">user@portfolio</span>
    <span className="text-white">:</span>
    <span className="text-blue-400 font-bold">{path.replace('/home/user', '~')}</span>
    <span className="text-white">$</span>
  </span>
);

// --- GEDIT (GUI EDITOR) ---
const GeditOverlay = ({ path, initialContent, onClose }: { path: string, initialContent: string, onClose: (c?: string) => void }) => {
  const [content, setContent] = useState(initialContent);
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()} // STOP focus stealing
    >
      <div className={`bg-[#1e1e1e] flex flex-col rounded-xl border border-gray-600 shadow-2xl overflow-hidden font-sans transition-all duration-200 ${isMaximized ? 'w-full h-full' : 'w-full max-w-3xl h-[80vh]'}`}>
        <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-gray-600">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-400" onClick={() => onClose()} title="Close without saving" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-not-allowed" />
            <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:bg-green-400" onClick={() => setIsMaximized(!isMaximized)} title="Maximize" />
          </div>
          <span className="text-gray-300 text-sm">{path} - gedit</span>
          <button onClick={() => onClose(content)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">Save & Close</button>
        </div>
        <textarea
          className="flex-1 bg-[#1e1e1e] text-gray-200 p-4 font-mono outline-none resize-none custom-scrollbar"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck="false"
          autoFocus
        />
      </div>
    </div>
  );
};

// --- VIM (CLI EDITOR) ---
const VimOverlay = ({ path, initialContent, onClose }: { path: string, initialContent: string, onClose: (c?: string) => void }) => {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<'NORMAL' | 'INSERT' | 'COMMAND'>('NORMAL');
  const [cmdText, setCmdText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Force strict focus based on Vim mode
  useEffect(() => {
    if (mode === 'INSERT') textareaRef.current?.focus();
    else containerRef.current?.focus();
  }, [mode]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // STOP focus stealing
    if (mode === 'INSERT') textareaRef.current?.focus();
    else containerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // STOP keys from bleeding into terminal buffer
    
    if (mode === 'NORMAL') {
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setMode('INSERT');
      } else if (e.key === ':') {
        e.preventDefault();
        setMode('COMMAND');
        setCmdText(':');
      }
    } else if (mode === 'INSERT') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMode('NORMAL');
      }
    } else if (mode === 'COMMAND') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMode('NORMAL');
        setCmdText('');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (cmdText === ':wq' || cmdText === ':x') onClose(content); 
        else if (cmdText === ':q!') onClose(); 
        else if (cmdText === ':q') {
          if (content !== initialContent) {
            setCmdText(':E37: No write since last change (add ! to override)');
            setMode('NORMAL');
          } else onClose();
        } else {
          setMode('NORMAL');
          setCmdText(`:Not an editor command: ${cmdText.substring(1)}`);
        }
      } else if (e.key === 'Backspace') {
        if (cmdText.length === 1) setMode('NORMAL');
        else setCmdText(prev => prev.slice(0, -1));
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setCmdText(prev => prev + e.key);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-50 bg-[#1e1e1e] text-gray-200 flex flex-col font-mono outline-none" 
      tabIndex={0} 
      onKeyDown={handleKeyDown} 
      onClick={handleClick}
    >
      <textarea
        ref={textareaRef}
        className={`flex-1 bg-transparent p-2 outline-none resize-none custom-scrollbar ${mode !== 'INSERT' ? 'caret-transparent' : ''}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        readOnly={mode !== 'INSERT'}
        spellCheck="false"
      />
      <div className="h-6 bg-gray-800 flex items-center px-2 text-sm justify-between">
        <div className="flex gap-4">
          <span className="font-bold">{mode === 'INSERT' ? '-- INSERT --' : mode === 'COMMAND' ? cmdText : `"${path}"`}</span>
        </div>
        <span className="text-gray-400">
          {mode === 'NORMAL' ? 'Type i to insert, Esc to normal, :wq to save & quit' : ''}
        </span>
      </div>
    </div>
  );
};

// --- MAIN TERMINAL UI ---
export default function TerminalUI() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { history, cwd, handleKeyDown, pager, theme, editor, closeEditor } = useTerminal();

  useEffect(() => {
    if (containerRef.current && !pager && !editor) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, input, pager, editor]);

  // FIX: Only focus the background terminal input if NO overlays are active
  const focusInput = () => {
    if (!pager && !editor) {
        inputRef.current?.focus();
    }
  };
  useEffect(() => focusInput(), [pager, editor]);

  return (
    <div 
      className="min-h-screen font-mono p-4 sm:p-8 cursor-text relative"
      style={{ backgroundColor: theme.bg, color: theme.fg }}
      onClick={focusInput}
    >
      
      {/* RENDER EDITORS */}
      {editor?.type === 'gedit' && (
        <GeditOverlay path={editor.path} initialContent={editor.content} onClose={closeEditor} />
      )}
      
      {editor?.type === 'vim' && (
        <VimOverlay path={editor.path} initialContent={editor.content} onClose={closeEditor} />
      )}

      {/* RENDER TERMINAL WINDOW */}
      <div className={`max-w-4xl mx-auto h-[90vh] overflow-y-auto custom-scrollbar ${editor?.type === 'vim' ? 'hidden' : 'block'}`} ref={containerRef}>
        
        {!pager && (
          <>
            <div className="mb-4">
              <p>Welcome to my interactive portfolio.</p>
              <p className="opacity-80">Type <span className="text-yellow-300 font-bold">help</span> to see available commands.</p>
            </div>

            {history.map((entry, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex gap-2">
                  <Prompt path={entry.cwd} />
                  <span>{entry.command}</span>
                </div>
                
                {entry.output && (
                  /* 1. CHECK FOR COMPONENT FIRST */
                  entry.output.component ? (
                    <div className="mt-1">
                      {/* Some components like 'matrix' also have text to show above the component */}
                      {entry.output.text && <div className="mb-2 whitespace-pre-wrap">{entry.output.text}</div>}
                      {entry.output.component}
                    </div>
                  ) : 
                  /* 2. THEN CHECK FOR HTML */
                  entry.output.isHTML ? (
                    <div className={`mt-1 whitespace-pre-wrap ${entry.output.isError ? 'text-red-400' : ''}`} dangerouslySetInnerHTML={{ __html: entry.output.text }} />
                  ) : 
                  /* 3. FALLBACK TO STANDARD TEXT */
                  (
                    <div className={`mt-1 whitespace-pre-wrap ${entry.output.isError ? 'text-red-400' : ''}`}>
                      {entry.output.text}
                    </div>
                  )
                )}
              </div>
            ))}
          </>
        )}

        {/* INTERACTIVE PAGER VIEW */}
        {pager && (
          <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
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

        {/* NORMAL TERMINAL PROMPT */}
        {!pager && !editor && (
          <div className="flex gap-2 items-center mt-2">
            <Prompt path={cwd} />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent outline-none border-none"
              style={{ color: theme.fg }}
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