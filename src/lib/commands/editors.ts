import { CommandHandler } from './types';
import { resolvePath, getNodeByPath } from '../vfs';

const openEditor = (args: string[], cwd: string, type: 'vim' | 'gedit') => {
  if (args.length === 0) return { text: `${type}: missing file operand`, isError: true };
  
  const targetPath = args[0];
  const fullPath = resolvePath(cwd, targetPath);
  const node = getNodeByPath(fullPath);

  if (node && node.type === 'dir') {
    return { text: `${type}: ${targetPath}: Is a directory`, isError: true };
  }

  return {
    text: '',
    editorTarget: {
      path: targetPath,
      content: node?.content || '', 
      type
    }
  };
};

export const editorCommands: Record<string, CommandHandler> = {
  vim: (args, { cwd }) => openEditor(args, cwd, 'vim'),
  vi: (args, { cwd }) => openEditor(args, cwd, 'vim'), 
  gedit: (args, { cwd }) => openEditor(args, cwd, 'gedit'),
  code: (args, { cwd }) => openEditor(args, cwd, 'gedit'), 
};