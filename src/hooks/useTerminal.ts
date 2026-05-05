import { useState, KeyboardEvent } from 'react';
import { parseAndExecute, CommandOutput, commands } from '../lib/commands';
import { getNodeByPath, resolvePath } from '../lib/vfs';

export interface TerminalEntry {
  command: string;
  output?: CommandOutput;
  cwd: string;
}

export function useTerminal() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [commandBuffer, setCommandBuffer] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [cwd, setCwd] = useState<string>('/home/user');

  const execute = async (cmd: string) => {
    if (cmd.trim() !== '') {
      setCommandBuffer((prev) => [...prev, cmd]);
    }
    setHistoryIndex(-1);

    const context = {
      cwd,
      setCwd,
      clearTerminal: () => setHistory([])
    };

    const output = await parseAndExecute(cmd, context);
    
    if (cmd !== 'clear') {
      setHistory((prev) => [...prev, { command: cmd, output: output || undefined, cwd }]);
    }
  };

  // --- NEW: Tab Auto-completion Logic ---
  const handleTabCompletion = (currentInput: string, setInput: (v: string) => void) => {
    if (!currentInput) return;

    const args = currentInput.split(' ');
    const isCommand = args.length === 1;

    if (isCommand) {
      // 1. Command Autocomplete
      const matches = Object.keys(commands).filter(cmd => cmd.startsWith(args[0]));
      
      if (matches.length === 1) {
        setInput(matches[0] + ' '); // Add a trailing space for convenience
      } else if (matches.length > 1) {
        // Print options to history if there are multiple matches
        setHistory(prev => [
          ...prev, 
          { command: currentInput, cwd },
          { command: '', output: { text: matches.join('  ') }, cwd }
        ]);
      }
    } else {
      // 2. File/Directory Autocomplete
      const target = args[args.length - 1];
      
      // Determine if they are typing a path like 'projects/ai-' or just 'ai-'
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
          
          // Reconstruct the path safely
          const newTarget = (dirPath !== '.' ? dirPath + '/' : '') + matches[0] + (isDir ? '/' : '');
          args[args.length - 1] = newTarget;
          setInput(args.join(' '));
        } else if (matches.length > 1) {
          // Print multiple file options to history
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
    if (e.key === 'Enter') {
      execute(currentInput);
      setInput('');
    } else if (e.key === 'Tab') {
      // Intercept Tab key to prevent input from losing focus
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

  return { history, cwd, handleKeyDown };
}