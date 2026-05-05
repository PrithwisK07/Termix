import { CommandContext, CommandOutput, CommandHandler } from './commands/types';
import { resolvePath, getNodeByPath, createNode } from './vfs';

import { networkCommands } from './commands/network';
import { fsCommands } from './commands/fs';
import { systemCommands } from './commands/System';
import { portfolioCommands } from './commands/portfolio';

export const commands: Record<string, CommandHandler> = {
  ...networkCommands,
  ...fsCommands,
  ...systemCommands,
  ...portfolioCommands,
};

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
    const result = await handler(args, currentCtx);

    if (result?.isError) return result;

    // --- FIX: Fast-return for Pager Content ---
    if (result?.pagerContent) {
        return result; 
    }

    if (result?.component) {
        return result; 
    }

    lastOutput = result?.text || '';
    isHTML = result?.isHTML || false;

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