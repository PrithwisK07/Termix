import { CommandHandler } from './types';

export const portfolioCommands: Record<string, CommandHandler> = {
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
  }
};