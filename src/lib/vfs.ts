export type FileType = 'file' | 'dir';

export interface VFSNode {
  type: FileType;
  name: string;
  content?: string;
  children?: Record<string, VFSNode>;
  permissions: string; 
  owner: string;
  group: string;
  size: number;
  dateModified: string;
}

const defaultDirMeta = { permissions: 'drwxr-xr-x', owner: 'user', group: 'staff', size: 96 };
const defaultFileMeta = { permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 0 };

function getCurrentDate() {
  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export const fileSystem: VFSNode = {
  type: 'dir', name: '/', ...defaultDirMeta, dateModified: getCurrentDate(),
  children: {
    home: {
      type: 'dir', name: 'home', ...defaultDirMeta, dateModified: getCurrentDate(),
      children: {
        user: {
          type: 'dir', name: 'user', ...defaultDirMeta, dateModified: getCurrentDate(), size: 1024,
          children: {
            'about.txt': { type: 'file', name: 'about.txt', content: 'Hi, I am Arjun...', ...defaultFileMeta, size: 220, dateModified: 'May 25 10:15' },
            'contact.txt': { type: 'file', name: 'contact.txt', content: 'Email: you@example.com', ...defaultFileMeta, size: 532, dateModified: 'May 25 10:15' },
            'resume.pdf': { type: 'file', name: 'resume.pdf', content: '[PDF Binary Mock]', ...defaultFileMeta, size: 1024, dateModified: 'May 25 10:22' },
            'projects': {
              type: 'dir', name: 'projects', ...defaultDirMeta, size: 160, dateModified: 'May 25 10:20',
              children: {
                'ai-chatbot': { type: 'dir', name: 'ai-chatbot', ...defaultDirMeta, dateModified: 'May 24 18:21' }
              }
            }
          }
        }
      }
    }
  }
};

export function resolvePath(cwd: string, targetPath: string): string {
  if (targetPath === '/') return '/';
  if (targetPath === '~') return '/home/user';
  
  const base = targetPath.startsWith('/') ? '/' : cwd;
  const parts = [...base.split('/'), ...targetPath.split('/')].filter(Boolean);
  
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') resolved.pop();
    else resolved.push(part);
  }
  return '/' + resolved.join('/');
}

export function getNodeByPath(path: string): VFSNode | null {
  if (path === '/') return fileSystem;
  const parts = path.split('/').filter(Boolean);
  let current: VFSNode | undefined = fileSystem;
  
  for (const part of parts) {
    if (current?.type !== 'dir' || !current.children) return null;
    current = current.children[part];
  }
  return current || null;
}

export function createNode(cwd: string, path: string, type: FileType): string | null {
  const fullPath = resolvePath(cwd, path);
  const parts = fullPath.split('/').filter(Boolean);
  const newName = parts.pop();
  if (!newName) return 'Invalid path';

  const parentPath = '/' + parts.join('/');
  const parentNode = getNodeByPath(parentPath);

  if (!parentNode) return `cannot create '${path}': No such file or directory`;
  if (parentNode.type !== 'dir') return `cannot create '${path}': Not a directory`;
  if (!parentNode.children) parentNode.children = {};
  if (parentNode.children[newName]) return `cannot create '${path}': File exists`;

  parentNode.children[newName] = {
    type,
    name: newName,
    ...(type === 'dir' ? defaultDirMeta : defaultFileMeta),
    dateModified: getCurrentDate()
  };
  return null; 
}

export function removeNode(cwd: string, path: string, recursive: boolean = false): string | null {
  const fullPath = resolvePath(cwd, path);
  if (fullPath === '/' || fullPath === '/home/user') return `rm: cannot remove '${path}': Permission denied`;

  const parts = fullPath.split('/').filter(Boolean);
  const targetName = parts.pop();
  const parentPath = '/' + parts.join('/');
  const parentNode = getNodeByPath(parentPath);

  if (!parentNode?.children || !targetName || !parentNode.children[targetName]) {
    return `rm: cannot remove '${path}': No such file or directory`;
  }

  const targetNode = parentNode.children[targetName];
  if (targetNode.type === 'dir' && !recursive) {
    return `rm: cannot remove '${path}': Is a directory`;
  }

  delete parentNode.children[targetName];
  return null; 
}

export function writeToFile(cwd: string, path: string, content: string): string | null {
  const fullPath = resolvePath(cwd, path);
  let node = getNodeByPath(fullPath);
  
  if (!node) {
    const error = createNode(cwd, path, 'file');
    if (error) return error;
    node = getNodeByPath(fullPath);
  }

  if (node?.type === 'dir') return `cannot write to '${path}': Is a directory`;
  
  if (node && node.type === 'file') {
    node.content = content;
    node.size = content.length;
    
    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    node.dateModified = `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  return null; 
}