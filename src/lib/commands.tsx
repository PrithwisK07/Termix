import React, { useEffect, useState, useRef } from 'react';
import { getNodeByPath, resolvePath, createNode, removeNode, VFSNode } from './vfs';
import { manuals, helpText } from './manuals';

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

// Updated type to allow for asynchronous commands like fetch/curl
type CommandHandler = (args: string[], ctx: CommandContext) => CommandOutput | void | Promise<CommandOutput | void>;

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

const TopMonitor = () => {
  const [stats, setStats] = useState({ uptime: 0, memory: 0, maxMemory: 0, pid1: '0.0' });
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;

  useEffect(() => {
    const timer = setInterval(() => {
      // Access browser performance memory (works in Chrome/Edge/Brave)
      const mem = (performance as any).memory;
      
      setStats({
        uptime: Math.floor(performance.now() / 1000), // Real session uptime in seconds
        memory: mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 64, // Fallback to 64MB if unsupported
        maxMemory: mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : 512,
        pid1: (Math.random() * 2 + 1).toFixed(1) // Minor fluctuation for the active UI thread
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="text-gray-300 w-full max-w-2xl bg-black p-2 border border-gray-700 rounded text-sm">
      <div className="flex justify-between font-bold mb-2 text-gray-100">
        <span>top - session up {formatUptime(stats.uptime)}, {cores} logical cores</span>
      </div>
      <div className="mb-2 text-gray-400">
        JS Heap: {stats.memory} MB / {stats.maxMemory} MB allocated
      </div>
      <table className="w-full text-left table-fixed">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="w-16 pl-1">PID</th><th className="w-20">USER</th>
            <th className="w-16">CPU%</th><th className="w-20">MEM(MB)</th>
            <th>PROCESS / THREAD</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="pl-1">101</td><td>browser</td><td>{stats.pid1}</td><td>{stats.memory}</td><td>React DOM UI Thread</td></tr>
          <tr><td className="pl-1">102</td><td>system</td><td>0.1</td><td>12</td><td>V8 Garbage Collector</td></tr>
          <tr><td className="pl-1">103</td><td>network</td><td>0.0</td><td>8</td><td>Fetch API Monitor</td></tr>
          <tr><td className="pl-1">104</td><td>vfs</td><td>0.0</td><td>4</td><td>Virtual File System</td></tr>
        </tbody>
      </table>
      <div className="mt-2 text-yellow-300 animate-pulse">[Press Ctrl+C to exit top]</div>
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

export const commands: Record<string, CommandHandler> = {
  help: () => {
    return { text: helpText, isHTML: true };
  },

  man: (args) => {
    if (args.length === 0) return { text: "What manual page do you want?\nFor example, try 'man ls'." };
    
    const cmd = args[0];
    const page = manuals[cmd];
    
    if (!page) {
      return { text: `No manual entry for ${cmd}\nPerhaps you meant 'help'?` };
    }

    return { text: page, isHTML: true };
  },

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
    let os = 'Unknown OS';
    let browser = 'Web Browser';
    let resolution = 'Unknown';
    let host = 'localhost';
    let cores: string | number = 'Unknown';

    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) os = 'Windows';
      else if (userAgent.includes('mac')) os = 'macOS';
      else if (userAgent.includes('linux')) os = 'Linux';
      else if (userAgent.includes('android')) os = 'Android';
      else if (userAgent.includes('like mac')) os = 'iOS';

      const isChrome = userAgent.includes('chrome');
      const isFirefox = userAgent.includes('firefox');
      const isSafari = userAgent.includes('safari') && !isChrome;
      browser = isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Web Browser';
      cores = navigator.hardwareConcurrency || 'Unknown';
    }

    if (typeof window !== 'undefined') {
      resolution = `${window.screen.width}x${window.screen.height}`;
      host = window.location.hostname || 'localhost';
    }

    const asciiArt = `
<span class="text-green-400">       A       </span>
<span class="text-green-400">      / \\      </span>   <span class="text-green-400 font-bold">user@portfolio</span>
<span class="text-green-400">     /   \\     </span>   -----------------
<span class="text-green-400">    /_____\\    </span>   <span class="text-blue-400 font-bold">OS:</span> ${os}
<span class="text-green-400">   /       \\   </span>   <span class="text-blue-400 font-bold">Host:</span> ${host}
<span class="text-green-400">  /         \\  </span>   <span class="text-blue-400 font-bold">Browser:</span> ${browser}
<span class="text-green-400"> /           \\ </span>   <span class="text-blue-400 font-bold">Resolution:</span> ${resolution}
<span class="text-green-400">/             \\</span>   <span class="text-blue-400 font-bold">CPU Cores:</span> ${cores} logical cores
                  <span class="text-blue-400 font-bold">Engine:</span> V8 / SpiderMonkey / WebKit
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

  curl: async (args) => {
    if (args.length === 0) return { text: "curl: try 'curl <url>' or 'man curl'", isError: true };
    
    let method = 'GET';
    let body: BodyInit | undefined = undefined;
    const headers: Record<string, string> = {};
    let url = '';

    // Simple Argument Parser
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-X' || args[i] === '--request') {
        method = args[++i].toUpperCase();
      } else if (args[i] === '-d' || args[i] === '--data') {
        body = args[++i];
        if (method === 'GET') method = 'POST'; // curl defaults to POST if -d is used
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (args[i] === '-H' || args[i] === '--header') {
        const headerParts = args[++i].split(':');
        if (headerParts.length >= 2) {
          headers[headerParts[0].trim()] = headerParts.slice(1).join(':').trim();
        }
      } else if (!args[i].startsWith('-')) {
        url = args[i];
      }
    }

    if (!url) return { text: "curl: no URL specified", isError: true };
    if (!url.startsWith('http')) url = 'https://' + url;

    let response;
    let time = 0;
    let proxyUsed = false;

    try {
      const start = performance.now();
      // 1. Attempt direct connection
      response = await fetch(url, { method, headers, body });
      time = Math.round(performance.now() - start);
    } catch (error) {
      // 2. If it fails (likely CORS), intercept and fallback to proxy
      try {
        const start = performance.now();
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
        proxyUsed = true;
        response = await fetch(proxyUrl, { method, headers, body });
        time = Math.round(performance.now() - start);
      } catch (proxyError) {
        return { text: `curl: (6) Could not resolve host or proxy failed for: ${url}`, isError: true };
      }
    }

    try {
      const contentType = response.headers.get('content-type');
      let data = '';

      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        data = JSON.stringify(json, null, 2);
      } else {
        data = await response.text();
      }

      if (data.length > 5000) {
          data = data.substring(0, 5000) + '\n\n... [Response truncated due to size]';
      }

      const proxyText = proxyUsed ? ` <span class="text-yellow-300">(via CORS Proxy)</span>` : '';
      return { text: `[Fetched in ${time}ms]${proxyText}\n${data}`, isHTML: true };
      
    } catch (parseError) {
      return { text: `curl: Failed to parse response from ${url}`, isError: true };
    }
  },

  top: () => {
    return { text: '', component: <TopMonitor /> };
  },

  matrix: () => {
    return { text: 'Initializing Matrix protocol...', component: <MatrixRain /> };
  }
};

// --- AST PARSER & EXECUTOR ---

// Changed to async function
export async function parseAndExecute(input: string, ctx: CommandContext): Promise<CommandOutput | void> {
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

    const tokens = tokenize(cmdPart);
    const [cmd, ...args] = tokens;

    const handler = commands[cmd];
    if (!handler) {
      return { text: `command not found: ${cmd}`, isError: true };
    }

    const currentCtx = { ...ctx, stdin: lastOutput };
    
    // Await the handler to support async fetch
    const result = await handler(args, currentCtx);

    if (result?.isError) return result;
    
    lastOutput = result?.text || '';
    isHTML = result?.isHTML || false;

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