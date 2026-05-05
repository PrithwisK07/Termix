import React, { useEffect, useState, useRef } from 'react';
import { CommandHandler } from './types';
import { manuals, helpText } from '../manuals';

const TopMonitor = () => {
  const [stats, setStats] = useState({ uptime: 0, memory: 0, maxMemory: 0, pid1: '0.0' });
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;

  useEffect(() => {
    const timer = setInterval(() => {
      const mem = (performance as any).memory;
      setStats({
        uptime: Math.floor(performance.now() / 1000), 
        memory: mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 64, 
        maxMemory: mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : 512,
        pid1: (Math.random() * 2 + 1).toFixed(1) 
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

export const systemCommands: Record<string, CommandHandler> = {
  help: () => ({ text: helpText, isHTML: true }),

  man: (args) => {
    if (args.length === 0) return { text: "What manual page do you want?\nFor example, try 'man ls'." };
    const page = manuals[args[0]];
    if (!page) return { text: `No manual entry for ${args[0]}\nPerhaps you meant 'help'?` };
    return { text: page, isHTML: true };
  },

  clear: (_, { clearTerminal }) => {
    clearTerminal();
  },

  whoami: () => ({ text: 'user' }),

  date: () => ({ text: new Date().toString() }),

  uname: (args) => {
    if (args.includes('-a')) return { text: 'Linux portfolio 5.15.0-105-generic #111-Ubuntu SMP x86_64 GNU/Linux' };
    return { text: 'Linux' };
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

  top: () => ({ text: '', component: <TopMonitor /> }),

  matrix: () => ({ text: 'Initializing Matrix protocol...', component: <MatrixRain /> })
};