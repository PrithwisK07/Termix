import { CommandHandler } from './types';
import { resolvePath, getNodeByPath, createNode, removeNode, VFSNode } from '../vfs';

export const fsCommands: Record<string, CommandHandler> = {
  pwd: (_, { cwd }) => ({ text: cwd }),
  
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
  }
};