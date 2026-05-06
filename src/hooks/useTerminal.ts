import { useState, KeyboardEvent } from 'react';
import { parseAndExecute, commands } from '../lib/commands';
import { CommandOutput, TerminalTheme } from '../lib/commands/types';
import { writeToFile, getNodeByPath, resolvePath } from '../lib/vfs';

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

export interface EditorState {
  path: string;
  content: string;
  type: 'vim' | 'gedit';
}

export function useTerminal() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [commandBuffer, setCommandBuffer] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [cwd, setCwd] = useState<string>('/home/user');
  
  // Advanced States
  const [pager, setPager] = useState<PagerState | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  
  // Theme & Alias States
  const [theme, setTheme] = useState<TerminalTheme>({
    name: 'dark',
    bg: '#1e1e1e',
    fg: '#e5e7eb'
  });
  
  const [aliases, setAliases] = useState<Record<string, string>>({
    'll': 'ls -la',
  });

  const setAlias = (name: string, cmd: string) => setAliases(prev => ({ ...prev, [name]: cmd }));

  const execute = async (cmd: string) => {
    if (cmd.trim() !== '') {
      setCommandBuffer((prev) => [...prev, cmd]);
    }
    setHistoryIndex(-1);

    const context = { 
      cwd, 
      setCwd, 
      clearTerminal: () => setHistory([]), 
      history, 
      setTheme, 
      aliases, 
      setAlias 
    };

    const output = await parseAndExecute(cmd, context);
    
    if (cmd !== 'clear') {
      if (output?.editorTarget) {
        setHistory((prev) => [...prev, { command: cmd, cwd }]);
        setEditor(output.editorTarget);
      } else if (output?.pagerContent) {
        setHistory((prev) => [...prev, { command: cmd, cwd }]); 
        const rawLines = output.pagerContent.split('\n');
        setPager({ content: rawLines, index: 0, isHTML: output.isHTML });
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: output || undefined, cwd }]);
      }
    }
  };

  const closeEditor = (newContent?: string) => {
    if (editor && newContent !== undefined) {
      const error = writeToFile(cwd, editor.path, newContent);
      if (error) {
        setHistory(prev => [...prev, { command: '', output: { text: error, isError: true }, cwd }]);
      } else {
        // Output the save message to the terminal!
        setHistory(prev => [...prev, { command: '', output: { text: `[${editor.type}] Saved ${editor.path} successfully.`, isHTML: false }, cwd }]);
      }
    }
    setEditor(null);
  };

  // --- TAB AUTO-COMPLETION ---
  const handleTabCompletion = (currentInput: string, setInput: (v: string) => void) => {
    if (!currentInput) return;

    const args = currentInput.split(' ');
    const isCommand = args.length === 1;

    if (isCommand) {
      const matches = Object.keys(commands).filter(cmd => cmd.startsWith(args[0]));
      
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setHistory(prev => [
          ...prev, 
          { command: currentInput, cwd },
          { command: '', output: { text: matches.join('  ') }, cwd }
        ]);
      }
    } else {
      const target = args[args.length - 1];
      const lastSlashIdx = target.lastIndexOf('/');
      const dirPath = lastSlashIdx !== -1 ? target.substring(0, lastSlashIdx) : '.';
      const partialName = lastSlashIdx !== -1 ? target.substring(lastSlashIdx + 1) : target;
      
      const resolvedDir = resolvePath(cwd, dirPath);
      const node = getNodeByPath(resolvedDir);
      
      if (node && node.type === 'dir' && node.children) {
        const matches = Object.keys(node.children).filter(name => name.startsWith(partialName));
        
        if (matches.length === 1) {
          const matchNode = node.children[matches[0]];
          const isDir = matchNode.type === 'dir';
          const newTarget = (dirPath !== '.' ? dirPath + '/' : '') + matches[0] + (isDir ? '/' : '');
          args[args.length - 1] = newTarget;
          setInput(args.join(' '));
        } else if (matches.length > 1) {
          setHistory(prev => [
            ...prev, 
            { command: currentInput, cwd },
            { command: '', output: { text: matches.join('  ') }, cwd }
          ]);
        }
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
    } else if (e.key === 'Tab') {
      e.preventDefault(); 
      handleTabCompletion(currentInput, setInput);
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

  return { history, cwd, handleKeyDown, pager, theme, editor, closeEditor };
}