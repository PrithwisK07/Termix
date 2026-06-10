'use client';
import { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';

// --- ASCII DONUT COMPONENT ---
const AsciiDonut = () => {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let A = 0, B = 0;
    
    const interval = setInterval(() => {
      const b = [];
      const z = [];
      A += 0.07;
      B += 0.03;
      
      const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
      
      for (let k = 0; k < 1760; k++) {
        b[k] = k % 80 === 79 ? "\n" : " ";
        z[k] = 0;
      }
      
      for (let j = 0; j < 6.28; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i),
            h = ct + 2,
            D = 1 / (sp * h * sA + st * cA + 5),
            t = sp * h * cA - st * sA;

          const x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
            y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
            o = x + 80 * y,
            N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
            
          if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
            z[o] = D;
            b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
          }
        }
      }
      
      if (preRef.current) {
        preRef.current.innerHTML = b.join("");
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center opacity-80 transition-opacity hover:opacity-100">
      <pre 
        ref={preRef} 
        className="font-mono text-[10px] leading-2.5 sm:text-xs sm:leading-3"
        style={{ 
          // 1. Define the Sunset Gradient with a CSS Variable fallback for theme responsiveness
          backgroundImage: 'var(--color-donut, linear-gradient(180deg, #fde047 5%, #f97316 25%, #ef4444 50%, #be185d 75%, #7e22ce 95%))',
          // 2. Clip the background to the text shape
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          // 3. Make the actual text transparent so the background gradient shows through
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          display: 'inline-block' 
        }}
      />
      {/* The text below remains unaffected by the gradient and strictly follows the theme prompt color */}
      <div className="mt-4 text-[10px] tracking-widest uppercase opacity-40 font-bold" style={{ color: 'var(--color-prompt, #4ade80)' }}>
        System Diagnostics Active
      </div>
    </div>
  );
};


// --- TERMINAL PROMPT COMPONENT ---
const Prompt = ({ path }: { path: string }) => (
  <span className="flex gap-2 font-mono shrink-0">
    <span className="font-bold" style={{ color: 'var(--color-prompt, #4ade80)' }}>user@portfolio</span>
    <span className="text-white">:</span>
    <span className="font-bold" style={{ color: 'var(--color-link, #60a5fa)' }}>{path.replace('/home/user', '~')}</span>
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
      onClick={(e) => e.stopPropagation()} 
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

// --- MAILER (DIRECT MESSAGE GUI) ---
const MailerOverlay = ({ onClose }: { onClose: (status?: string) => void }) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !body) return;
    
    setIsSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message: body })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      setIsSending(false);
      onClose('SENT'); // Tells the terminal to print the success message
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      // You could handle an error state here, but for now we'll just close it
      onClose('ERROR'); 
    }
  };

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()} 
    >
      <div className="bg-[#1e1e1e] flex flex-col rounded-xl border border-gray-600 shadow-2xl overflow-hidden font-sans w-full max-w-2xl">
        {/* Header */}
        <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-gray-600">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-400" onClick={() => onClose()} title="Discard Message" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-not-allowed" />
            <div className="w-3 h-3 rounded-full bg-green-500 cursor-not-allowed" />
          </div>
          <span className="text-gray-300 text-sm font-mono">New Message - NullVoid Mailer</span>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="flex flex-col p-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              required
              placeholder="Your Email"
              className="flex-1 bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500 font-mono text-sm transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              autoFocus
            />
            <input
              type="text"
              placeholder="Subject"
              className="flex-1 bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500 font-mono text-sm transition-colors"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>
          
          <textarea
            required
            placeholder="Type your message here..."
            className="w-full h-48 bg-[#2d2d2d] border border-gray-600 rounded px-3 py-2 text-gray-200 outline-none focus:border-blue-500 font-mono text-sm resize-none custom-scrollbar transition-colors"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSending}
          />
          
          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={() => onClose()} 
              className="px-4 py-2 text-sm font-mono text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              disabled={isSending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSending || !email || !body}
              className="px-6 py-2 text-sm font-mono bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? 'Transmitting...' : 'Send Message'}
            </button>
          </div>
        </form>
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

  useEffect(() => {
    if (mode === 'INSERT') textareaRef.current?.focus();
    else containerRef.current?.focus();
  }, [mode]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'INSERT') textareaRef.current?.focus();
    else containerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
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

  // --- BOOT SEQUENCE STATE ---
  const [showWelcome, setShowWelcome] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setShowWelcome(true), 100);
    const bootTimer = setTimeout(() => setBootComplete(true), 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(bootTimer);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current && !pager && !editor) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, input, pager, editor, showWelcome, bootComplete]);

  const focusInput = () => {
    if (!editor && bootComplete) {
        inputRef.current?.focus();
    }
  };
  useEffect(() => focusInput(), [pager, editor, bootComplete]);

  return (
    <div 
      className="min-h-screen font-mono p-4 sm:p-8 cursor-text relative transition-colors duration-300"
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

      {/* NEW: RENDER MAILER */}
      {editor?.type === 'mailer' && (
        <MailerOverlay onClose={closeEditor} />
      )}

      {/* RENDER MAIN LAYOUT */}
      <div className={`max-w-7xl mx-auto h-[90vh] flex gap-4 lg:gap-8 ${editor?.type === 'vim' ? 'hidden' : 'flex'}`}>
        
        {/* LEFT COMPARTMENT: TERMINAL WINDOW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2" ref={containerRef}>
          
          {!pager && (
            <>
              <div className={`mb-8 transition-opacity duration-1000 ease-in-out ${showWelcome ? 'opacity-100' : 'opacity-0'}`}>                
                <div className="flex flex-col gap-1 mt-4">
                  <p>Welcome to NullVoid OS (v1.0.0) - Interactive Terminal Portfolio.</p>
                  <p className="opacity-80">
                    Type <span className="font-bold" style={{ color: 'var(--color-prompt, #4ade80)' }}>help</span> to see available commands.
                  </p>
                </div>
              </div>

              {history.map((entry, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex gap-2">
                    <Prompt path={entry.cwd} />
                    <span className="break-all">{entry.command}</span>
                  </div>
                  
                  {entry.output && (
                    entry.output.component ? (
                      <div className="mt-1">
                        {entry.output.text && <div className="mb-2 whitespace-pre-wrap">{entry.output.text}</div>}
                        {entry.output.component}
                      </div>
                    ) : entry.output.isHTML ? (
                      <div className={`mt-1 whitespace-pre-wrap wrap-break-word ${entry.output.isError ? 'text-red-400' : ''}`} dangerouslySetInnerHTML={{ __html: entry.output.text }} />
                    ) : (
                      <div className={`mt-1 whitespace-pre-wrap wrap-break-word ${entry.output.isError ? 'text-red-400' : ''}`}>
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
                autoFocus
              />
            </div>
          )}

          {/* NORMAL TERMINAL PROMPT - Hides until boot sequence finishes */}
          {!pager && !editor && bootComplete && (
            <div className="flex gap-2 items-center mt-2 animate-pulse" style={{ animationIterationCount: 1 }}>
              <Prompt path={cwd} />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent outline-none border-none focus:ring-0"
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

        {/* RIGHT COMPARTMENT: ASCII DONUT WIDGET */}
        {!pager && !editor && (
          <div className="hidden lg:flex flex-col items-center justify-center w-87.5 shrink-0 border-l border-gray-700/30 pl-8 pointer-events-none">
            <AsciiDonut />
          </div>
        )}

      </div>
    </div>
  );
}