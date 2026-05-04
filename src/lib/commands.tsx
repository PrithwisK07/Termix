import React, { useEffect, useState, useRef } from 'react';
import { getNodeByPath, resolvePath, createNode, removeNode, VFSNode } from './vfs';

export interface CommandContext {
  cwd: string;
  setCwd: (path: string) => void;
  clearTerminal: () => void;
  stdin?: string;
}

export interface CommandOutput {
  text: string;
  isError?: boolean;
  isHTML?: boolean;
  component?: React.ReactNode;
}

type CommandHandler = (args: string[], ctx: CommandContext) => CommandOutput | void;

// --- HELPER: Tokenizer ---
// Safely splits arguments, keeping quoted strings together 
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if ((char === '"' || char === "'") && (i === 0 || input[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ' ' && !inQuotes) {
      if (current) tokens.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

// --- REACT COMPONENTS FOR ADVANCED COMMANDS ---

const TopMonitor = () => {
  const [uptime, setUptime] = useState(0);
  const [cpuStats, setCpuStats] = useState({ pid1: '12.4', pid2: '8.1' });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
      // FIXED: Move Math.random() into state updates to keep render pure
      setCpuStats({
        pid1: (12.4 + Math.random() * 2).toFixed(1),
        pid2: (8.1 + Math.random() * 2).toFixed(1)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-gray-300 w-full max-w-2xl bg-black p-2 border border-gray-700 rounded">
      <div className="flex justify-between font-bold mb-2">
        <span>top - {new Date().toLocaleTimeString()} up {uptime} min, 1 user, load avg: 0.42, 0.35</span>
      </div>
      <div className="mb-2">Tasks: 36 total, 1 running, 35 sleeping, 0 stopped</div>
      <table className="w-full text-left table-fixed">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="w-16">PID</th><th className="w-20">USER</th>
            <th className="w-16">CPU%</th><th className="w-16">MEM%</th>
            <th>COMMAND</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>101</td><td>user</td><td>{cpuStats.pid1}</td><td>24.5</td><td>portfolio-shell</td></tr>
          <tr><td>102</td><td>user</td><td>{cpuStats.pid2}</td><td>12.1</td><td>node server.js</td></tr>
          <tr><td>103</td><td>user</td><td>3.2</td><td>8.3</td><td>code editor</td></tr>
          <tr><td>104</td><td>user</td><td>1.5</td><td>2.6</td><td>system monitor</td></tr>
        </tbody>
      </table>
      <div className="mt-2 text-yellow-300 animate-pulse">[Press Ctrl+C to exit top - Simulated]</div>
    </div>
  );
};

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 300;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array.from({ length: columns }).map(() => 1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="border border-green-900 rounded my-2" />;
};

// --- COMMAND HANDLERS ---

export const commands: Record<string, CommandHandler> = {
  help: () => ({
    text: `Available commands:
  ls       - List directory contents
  cd       - Change directory
  pwd      - Print working directory
  cat      - Concatenate and print files
  clear    - Clear terminal output
  whoami   - Print current user
  about    - Display author info
  skills   - List technical skills (try --graph)
  projects - List portfolio projects
  neofetch - System information
  tree     - View directory structure
  top      - View simulated system processes
  matrix   - Enter the matrix`,
  }),

  pwd: (_, { cwd }) => ({ text: cwd }),
  
  whoami: () => ({ text: 'user' }),

  date: () => ({ text: new Date().toString() }),

  uname: (args) => {
    if (args.includes('-a')) {
      return { text: 'Linux portfolio 5.15.0-105-generic #111-Ubuntu SMP x86_64 GNU/Linux' };
    }
    return { text: 'Linux' };
  },

  clear: (_, { clearTerminal }) => {
    clearTerminal();
  },

  cd: (args, { cwd, setCwd }) => {
    const target = args.length === 0 ? '~' : args[0];
    const resolved = resolvePath(cwd, target);
    const node = getNodeByPath(resolved);

    if (!node) return { text: `cd: ${target}: No such file or directory`, isError: true };
    if (node.type !== 'dir') return { text: `cd: ${target}: Not a directory`, isError: true };

    setCwd(resolved);
  },

  ls: (args, { cwd }) => {
    const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
    
    const targetPath = args.find(a => !a.startsWith('-')) || cwd;
    const node = getNodeByPath(resolvePath(cwd, targetPath));

    if (!node) return { text: `ls: cannot access '${targetPath}': No such file or directory`, isError: true };
    if (node.type === 'file') return { text: node.name };

    let children = Object.values(node.children || {});
    if (!showHidden) {
      children = children.filter(c => !c.name.startsWith('.'));
    }

    if (!showLong) {
      const output = children
        .map(c => c.type === 'dir' ? `<span class="text-blue-400 font-bold">${c.name}</span>` : `<span class="text-gray-300">${c.name}</span>`)
        .join('  ');
      return { text: output, isHTML: true };
    }

    const totalSize = children.reduce((acc, curr) => acc + curr.size, 0);
    let output = `total ${Math.ceil(totalSize / 1024) * 4}\n`;
    
    output += children.map(c => {
      const nameCol = c.type === 'dir' ? `<span class="text-blue-400 font-bold">${c.name}</span>` : `<span class="text-gray-300">${c.name}</span>`;
      return `${c.permissions}  1 ${c.owner}  ${c.group}  ${c.size.toString().padStart(4, ' ')} ${c.dateModified} ${nameCol}`;
    }).join('\n');

    return { text: output, isHTML: true };
  },

  cat: (args, { cwd }) => {
    if (args.length === 0) return { text: 'cat: missing file operand', isError: true };
    
    const target = resolvePath(cwd, args[0]);
    const node = getNodeByPath(target);

    if (!node) return { text: `cat: ${args[0]}: No such file or directory`, isError: true };
    if (node.type === 'dir') return { text: `cat: ${args[0]}: Is a directory`, isError: true };

    return { text: node.content || '' };
  },

  touch: (args, { cwd }) => {
    if (args.length === 0) return { text: "touch: missing file operand", isError: true };
    const error = createNode(cwd, args[0], 'file');
    if (error) return { text: error, isError: true };
  },

  mkdir: (args, { cwd }) => {
    if (args.length === 0) return { text: "mkdir: missing operand", isError: true };
    const error = createNode(cwd, args[0], 'dir');
    if (error) return { text: error, isError: true };
  },

  rm: (args, { cwd }) => {
    if (args.length === 0) return { text: "rm: missing operand", isError: true };
    const isRecursive = args.includes('-r') || args.includes('-rf');
    const targets = args.filter(a => !a.startsWith('-'));
    
    for (const target of targets) {
      const error = removeNode(cwd, target, isRecursive);
      if (error) return { text: error, isError: true };
    }
  },

  echo: (args) => {
    return { text: args.join(' ') };
  },

  grep: (args, { cwd, stdin }) => {
    if (args.length === 0) return { text: "grep: missing pattern", isError: true };
    
    const pattern = args[0];
    let contentToSearch = stdin;

    if (!contentToSearch && args.length > 1) {
      const fileNode = getNodeByPath(resolvePath(cwd, args[1]));
      if (!fileNode) return { text: `grep: ${args[1]}: No such file`, isError: true };
      if (fileNode.type === 'dir') return { text: `grep: ${args[1]}: Is a directory`, isError: true };
      contentToSearch = fileNode.content;
    }

    if (!contentToSearch) return { text: "" };

    const lines = contentToSearch.split('\n');
    const matchedLines = lines.filter(line => line.includes(pattern));
    
    const highlighted = matchedLines.map(line => {
      return line.replaceAll(pattern, `<span class="text-red-400 font-bold">${pattern}</span>`);
    }).join('\n');

    return { text: highlighted, isHTML: true };
  },

  tree: (args, { cwd }) => {
    const target = args.length > 0 ? resolvePath(cwd, args[0]) : cwd;
    const rootNode = getNodeByPath(target);

    if (!rootNode) return { text: `tree: ${target}: No such directory`, isError: true };
    if (rootNode.type === 'file') return { text: rootNode.name };

    let dirCount = 0;
    let fileCount = 0;

    const buildTree = (node: VFSNode, prefix: string = ''): string => {
      if (!node.children) return '';
      const keys = Object.keys(node.children);
      let result = '';

      keys.forEach((key, index) => {
        const child = node.children![key];
        const isLast = index === keys.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        if (child.type === 'dir') {
          dirCount++;
          result += `${prefix}${connector}<span class="text-blue-400 font-bold">${child.name}</span>\n`;
          result += buildTree(child, prefix + (isLast ? '    ' : '│   '));
        } else {
          fileCount++;
          result += `${prefix}${connector}<span class="text-gray-300">${child.name}</span>\n`;
        }
      });
      return result;
    };

    const treeOutput = `<span class="text-blue-400 font-bold">.</span>\n${buildTree(rootNode)}\n\n${dirCount} directories, ${fileCount} files`;
    return { text: treeOutput, isHTML: true };
  },

  neofetch: () => {
    const asciiArt = `
<span class="text-green-400">       A       </span>
<span class="text-green-400">      / \\      </span>   <span class="text-green-400 font-bold">user@portfolio</span>
<span class="text-green-400">     /   \\     </span>   -----------------
<span class="text-green-400">    /_____\\    </span>   <span class="text-blue-400 font-bold">OS:</span> Custom Linux x86_64
<span class="text-green-400">   /       \\   </span>   <span class="text-blue-400 font-bold">Host:</span> Portfolio Terminal
<span class="text-green-400">  /         \\  </span>   <span class="text-blue-400 font-bold">Kernel:</span> 1.0.0-portfolio
<span class="text-green-400"> /           \\ </span>   <span class="text-blue-400 font-bold">Uptime:</span> 2 hours, 15 mins
<span class="text-green-400">/             \\</span>   <span class="text-blue-400 font-bold">Shell:</span> portfolio-shell 1.0.0
                  <span class="text-blue-400 font-bold">Terminal:</span> web-terminal
                  <span class="text-blue-400 font-bold">CPU:</span> WebAssembly Virtual CPU
                  <span class="text-blue-400 font-bold">Memory:</span> 128MB / 512MB
    `;
    
    const palette = `
    <span class="bg-black text-black">██</span><span class="bg-red-500 text-red-500">██</span><span class="bg-green-500 text-green-500">██</span><span class="bg-yellow-500 text-yellow-500">██</span><span class="bg-blue-500 text-blue-500">██</span><span class="bg-purple-500 text-purple-500">██</span><span class="bg-cyan-500 text-cyan-500">██</span><span class="bg-white text-white">██</span>
    `;

    return { text: `<div class="flex flex-col">${asciiArt}${palette}</div>`, isHTML: true };
  },

  skills: (args) => {
    const skillData = [
      { name: 'JavaScript', percent: 95, color: 'text-yellow-300' },
      { name: 'TypeScript', percent: 90, color: 'text-blue-400' },
      { name: 'React', percent: 90, color: 'text-cyan-400' },
      { name: 'Node.js', percent: 85, color: 'text-green-400' },
      { name: 'Python', percent: 85, color: 'text-blue-300' },
      { name: 'Next.js', percent: 75, color: 'text-gray-300' },
      { name: 'Tailwind CSS', percent: 75, color: 'text-teal-400' },
      { name: 'Git & DevOps', percent: 70, color: 'text-orange-400' },
    ];

    if (args.includes('--graph')) {
      const output = skillData.map(skill => {
        const blocks = Math.round(skill.percent / 5);
        const filled = '█'.repeat(blocks);
        const empty = '░'.repeat(20 - blocks);
        const paddedName = skill.name.padEnd(14, ' ');
        
        return `${paddedName} [<span class="${skill.color}">${filled}</span><span class="text-gray-600">${empty}</span>] ${skill.percent}%`;
      }).join('\n');
      
      return { text: output, isHTML: true };
    }

    const simpleOutput = skillData.map(s => s.name).join(', ');
    return { text: `Languages & Frameworks:\n${simpleOutput}\n\nTip: Try 'skills --graph' for a detailed view.` };
  },

  about: () => {
    const face = `
<span class="text-green-400">      .-"""-.      </span>
<span class="text-green-400">     /       \\     </span>
<span class="text-green-400">     \\ \\   / /     </span>
<span class="text-green-400">   .-/-------{\\-.  </span>
<span class="text-green-400">   |/         \\|   </span>
    `;
    const text = `
Hi there! 👋
I'm Arjun, a Full Stack Developer
who loves building scalable,
performant and beautiful
web applications.
I enjoy turning ideas into
real-world products.

<span class="text-blue-400 font-bold">Location:</span> Earth 🌍
<span class="text-blue-400 font-bold">Focus:</span> Web Development
<span class="text-blue-400 font-bold">Interests:</span> AI, DevTools, Open Source
    `;
    return { text: `<div class="flex gap-8 items-center"><pre>${text}</pre><pre>${face}</pre></div>`, isHTML: true };
  },

  github: () => {
    setTimeout(() => window.open('https://github.com/your-username', '_blank'), 1000);
    return { 
      text: `Opening GitHub Profile...\n<span class="text-blue-400">https://github.com/your-username</span>\n[<span class="text-green-400">####################</span>] 100%\n\n✓ Done`, 
      isHTML: true 
    };
  },
  
  linkedin: () => {
    setTimeout(() => window.open('https://linkedin.com/in/your-username', '_blank'), 800);
    return { text: 'Opening LinkedIn profile in a new tab...' };
  },

  resume: (args) => {
    if (args.includes('--download')) {
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.download = 'Arjun_Resume.pdf';
      link.click();
      return { text: 'Downloading resume...' };
    }
    
    setTimeout(() => window.open('/resume.pdf', '_blank'), 800);
    return { text: 'Opening resume.pdf...\n\nTip: use "resume --download" to download directly.' };
  },

  projects: () => {
    return { text: `<span class="text-blue-400 font-bold">ai-chatbot</span>  <span class="text-blue-400 font-bold">dev-portfolio</span>  <span class="text-blue-400 font-bold">task-manager</span>\n\nType <span class="text-yellow-300">cd projects</span> to explore.`, isHTML: true };
  },

  curl: (args) => {
    if (args.length === 0) return { text: "curl: try 'curl <url>'", isError: true };
    if (args[0].includes('github.com')) {
      return { 
        text: `{\n  "login": "user",\n  "name": "Arjun",\n  "public_repos": 42,\n  "followers": 128\n}`,
        isHTML: false 
      };
    }
    return { text: `Fetching data from ${args[0]}...\n<HTML><HEAD><TITLE>301 Moved</TITLE></HEAD></HTML>` };
  },

  top: () => {
    return { text: '', component: <TopMonitor /> };
  },

  matrix: () => {
    return { text: 'Initializing Matrix protocol...', component: <MatrixRain /> };
  }
};

// --- AST PARSER & EXECUTOR ---

export function parseAndExecute(input: string, ctx: CommandContext): CommandOutput | void {
  const trimmed = input.trim();
  if (!trimmed) return;

  const pipedCommands = trimmed.split('|').map(cmd => cmd.trim());
  
  let lastOutput: string | undefined = undefined;
  let isHTML = false;

  for (let i = 0; i < pipedCommands.length; i++) {
    const rawCmd = pipedCommands[i];
    
    const redirSplit = rawCmd.split('>');
    const cmdPart = redirSplit[0].trim();
    const redirectTarget = redirSplit[1]?.trim();

    // The 'tokens' error was because this function wasn't properly copied
    const tokens = tokenize(cmdPart);
    const [cmd, ...args] = tokens;

    const handler = commands[cmd];
    if (!handler) {
      return { text: `command not found: ${cmd}`, isError: true };
    }

    const currentCtx = { ...ctx, stdin: lastOutput };
    const result = handler(args, currentCtx);

    if (result?.isError) return result;
    
    lastOutput = result?.text || '';
    isHTML = result?.isHTML || false;

    // Support returning components (like top, matrix)
    if (result?.component) {
        return result; 
    }

    if (redirectTarget) {
      const targetPath = resolvePath(ctx.cwd, redirectTarget);
      let node = getNodeByPath(targetPath);
      
      if (!node) {
        const createErr = createNode(ctx.cwd, redirectTarget, 'file');
        if (createErr) return { text: createErr, isError: true };
        node = getNodeByPath(targetPath);
      }
      
      if (node && node.type === 'file') {
        node.content = (lastOutput || '').replace(/<[^>]*>?/gm, ''); 
        node.size = node.content.length;
        lastOutput = ''; 
        isHTML = false;
      } else {
        return { text: `${redirectTarget}: Is a directory`, isError: true };
      }
    }
  }

  return { text: lastOutput || '', isHTML };
}