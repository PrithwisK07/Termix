import React, { useState, useEffect } from 'react';
import { CommandHandler } from './types';

const RealPing = ({ host }: { host: string }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [stats, setStats] = useState({ sent: 0, received: 0 });

  useEffect(() => {
    let active = true;
    let count = 0;
    const maxPings = 4;
    
    const url = host.startsWith('http') ? host : `https://${host}`;

    const doPing = async () => {
      if (!active || count >= maxPings) return;
      count++;
      
      const start = performance.now();
      try {
        await fetch(url, { mode: 'no-cors', cache: 'no-store' });
        const time = (performance.now() - start).toFixed(1);
        if (active) {
          setLines(prev => [...prev, `Reply from ${host}: time=${time}ms protocol=HTTP`]);
          setStats(s => ({ ...s, sent: count, received: s.received + 1 }));
        }
      } catch (e) {
        console.log(e);
        if (active) {
          setLines(prev => [...prev, `Request timeout for ${host}`]);
          setStats(s => ({ ...s, sent: count, received: s.received }));
        }
      }
      
      if (active && count < maxPings) setTimeout(doPing, 1000);
    };

    doPing();
    return () => { active = false; };
  }, [host]);

  return (
    <div className="flex flex-col">
      <span>Pinging {host} with 32 bytes of data:</span>
      {lines.map((line, i) => <span key={i}>{line}</span>)}
      {lines.length >= 4 && (
        <span className="mt-2">
          Ping statistics for {host}:<br />
          Packets: Sent = {stats.sent}, Received = {stats.received}, Lost = {stats.sent - stats.received} ({Math.round(((stats.sent - stats.received) / stats.sent) * 100)}% loss)
        </span>
      )}
    </div>
  );
};

export const utilsCommands: Record<string, CommandHandler> = {
  alias: (args, { aliases, setAlias }) => {
    if (args.length === 0) {
      const list = Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
      return { text: list || 'No aliases defined.' };
    }
    
    const input = args.join(' ');
    const splitIdx = input.indexOf('=');
    if (splitIdx === -1) return { text: `alias: ${input}: not found`, isError: true };
    
    const name = input.substring(0, splitIdx).trim();
    let cmd = input.substring(splitIdx + 1).trim();
    
    if ((cmd.startsWith("'") && cmd.endsWith("'")) || (cmd.startsWith('"') && cmd.endsWith('"'))) {
      cmd = cmd.slice(1, -1);
    }
    
    setAlias(name, cmd);
    return { text: '' }; 
  },

  history: (args, { history }) => {
    const output = history
      .map((entry, index) => `  ${(index + 1).toString().padStart(3, ' ')}  ${entry.command}`)
      .join('\n');
    return { text: output };
  },

  sudo: () => {
    return { 
      text: "user is not in the sudoers file. This incident will be reported.", 
      isError: true 
    };
  },

  ping: (args) => {
    if (args.length === 0) return { text: "Usage: ping <destination>", isError: true };
    const host = args[0].replace(/\/$/, ""); 
    return { text: '', component: <RealPing host={host} /> };
  },

  calc: (args) => {
    if (args.length === 0) return { text: "Usage: calc <expression>", isError: true };
    const expr = args.join(' ');
    try {
      const result = new Function('return ' + expr.replace(/[^-()\d/*+.]/g, ''))();
      return { text: `${result}` };
    } catch (e) {
      console.error(e);
      return { text: `calc: parse error`, isError: true };
    }
  },

  cowsay: (args) => {
    if (args.length === 0) return { text: "Usage: cowsay <message>", isError: true };
    const msg = args.join(' ');
    const border = '-'.repeat(msg.length + 2);
    const cow = `
 < ${msg} >
  ${border}
         \\   ^__^ 
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||
    `;
    return { text: cow };
  },

  coffee: () => {
    const cup = `
      (  )   (   )  )
       ) (   )  (  (
       ( )  (    ) )
       _____________
      <_____________> ___
      |             |/ _ \\
      |               | | |
      |               |_| |
   ___|             |\\___/
  /    \\___________/    \\
  \\_____________________/
    `;
    return { text: cup };
  },

  theme: (args, { setTheme }) => {
    const predefinedThemes: Record<string, { bg: string, fg: string, prompt?: string, link?: string, ascii?: string }> = {
      dark: { bg: '#1e1e1e', fg: '#e5e7eb' },
      light: { bg: '#f9fafb', fg: '#111827' },
      dracula: { bg: '#282a36', fg: '#f8f8f2' },
      hacker: { bg: '#000000', fg: '#22c55e' },
      synthwave: { bg: '#2b213a', fg: '#ff7edb' },
      midnight: {
        bg: '#241528',
        fg: '#D7D3DC',
        prompt: '#3AFF7A',
        link: '#8BE9FD',
        ascii: '#F1EEE8'
      },
      deepspace: {
        bg: '#00001B',
        fg: '#C9D0DD',
        prompt: '#00D9FF',
        link: '#C084FC',
        ascii: '#E7EBF2'
      }
    };

    if (args.length === 0) {
      const names = Object.keys(predefinedThemes).join(', ');
      return { 
        text: `Usage: \n  theme <name> [${names}]\n  theme custom --bg <hex> --fg <hex>\n\nExample: theme custom --bg #000000 --fg #ff00ff` 
      };
    }

    if (args[0] === 'custom') {
      let bg = '#1e1e1e';
      let fg = '#e5e7eb';
      
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--bg' && args[i+1]) bg = args[++i];
        if (args[i] === '--fg' && args[i+1]) fg = args[++i];
      }

      setTheme({ name: 'custom', bg, fg });
      return { text: `Applied custom theme (BG: ${bg}, FG: ${fg})` };
    }

    const selected = predefinedThemes[args[0]];
    if (!selected) {
      return { text: `theme: unknown theme '${args[0]}'`, isError: true };
    }

    // Apply main background and foreground
    setTheme({ name: args[0], bg: selected.bg, fg: selected.fg });

    // Apply accent colors directly to the CSS OM so elements can pick them up dynamically
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-prompt', selected.prompt || '#4ade80'); // Fallback to green-400
      document.documentElement.style.setProperty('--color-link', selected.link || '#60a5fa');   // Fallback to blue-400
      document.documentElement.style.setProperty('--color-ascii', selected.ascii || selected.fg); // Fallback to fg
    }

    return { text: `Theme set to ${args[0]}` };
  },

  weather: async (args) => {
    const city = args.length > 0 ? args.join(' ') : '';
    try {
      const res = await fetch(`https://wttr.in/${city}?0AT`);
      const data = await res.text();
      return { text: data };
    } catch (e) {
      console.error(e);
      return { text: "weather: failed to connect to meteorological servers", isError: true };
    }
  }
};