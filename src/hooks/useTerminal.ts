import { useState, KeyboardEvent } from 'react';
import { parseAndExecute } from '../lib/commands';
import { CommandOutput } from '@/lib/commands/types';

export interface TerminalEntry {
  command: string;
  output?: CommandOutput;
  cwd: string;
}

export interface PagerState {
  content: string[];
  index: number;
  isHTML?: boolean;
}

export function useTerminal() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [commandBuffer, setCommandBuffer] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [cwd, setCwd] = useState<string>('/home/user');
  
  const [pager, setPager] = useState<PagerState | null>(null);

  const execute = async (cmd: string) => {
    if (cmd.trim() !== '') {
      setCommandBuffer((prev) => [...prev, cmd]);
    }
    setHistoryIndex(-1);

    const context = { cwd, setCwd, clearTerminal: () => setHistory([]) };
    const output = await parseAndExecute(cmd, context);
    
    if (cmd !== 'clear') {
      if (output?.pagerContent) {
        setHistory((prev) => [...prev, { command: cmd, cwd }]); 
        const rawLines = output.pagerContent.split('\n');
        setPager({ content: rawLines, index: 0, isHTML: output.isHTML });
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: output || undefined, cwd }]);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, currentInput: string, setInput: (v: string) => void) => {
    if (pager) {
      e.preventDefault();
      const PAGE_SIZE = 24; 
      const maxIndex = Math.max(0, pager.content.length - PAGE_SIZE);

      if (e.key === 'q' || e.key === 'Q' || (e.ctrlKey && e.key === 'c')) {
        setPager(null); 
      } else if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setPager(p => p ? { ...p, index: Math.min(p.index + 1, maxIndex) } : null);
      } else if (e.key === ' ' || e.key === 'PageDown') {
        setPager(p => p ? { ...p, index: Math.min(p.index + PAGE_SIZE, maxIndex) } : null);
      } else if (e.key === 'ArrowUp') {
        setPager(p => p ? { ...p, index: Math.max(p.index - 1, 0) } : null); 
      }
      return;
    }

    if (e.key === 'Enter') {
      execute(currentInput);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandBuffer.length === 0) return;
      const newIndex = Math.min(historyIndex + 1, commandBuffer.length - 1);
      setHistoryIndex(newIndex);
      setInput(commandBuffer[commandBuffer.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandBuffer[commandBuffer.length - 1 - newIndex]);
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setHistory((prev) => [...prev, { command: currentInput + '^C', cwd }]);
      setInput('');
    }
  };

  return { history, cwd, handleKeyDown, pager };
}