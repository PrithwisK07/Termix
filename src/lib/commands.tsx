import { CommandContext, CommandOutput, CommandHandler } from './commands/types';
import { resolvePath, getNodeByPath, createNode } from './vfs';

// --- IMPORT DOMAIN CLUSTERS ---
import { networkCommands } from './commands/network';
import { fsCommands } from './commands/fs';
import { systemCommands } from './commands/System';
import { portfolioCommands } from './commands/portfolio';
import { utilsCommands } from './commands/utils';
import { editorCommands } from './commands/editors';

// --- MAIN COMMAND REGISTRY ---
export const commands: Record<string, CommandHandler> = {
  ...networkCommands,
  ...fsCommands,
  ...systemCommands,
  ...portfolioCommands,
  ...utilsCommands,
  ...editorCommands,
};

// --- HELPER: Tokenizer ---
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

// --- AST PARSER & EXECUTOR ---
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
    let [cmd, ...args] = tokens;

    // --- ALIAS RESOLUTION ---
    if (ctx.aliases && ctx.aliases[cmd]) {
      const aliasTokens = tokenize(ctx.aliases[cmd]);
      cmd = aliasTokens[0];
      args = [...aliasTokens.slice(1), ...args];
    }

    const handler = commands[cmd];
    if (!handler) {
      return { text: `command not found: ${cmd}`, isError: true };
    }

    const currentCtx = { ...ctx, stdin: lastOutput };
    
    // Execute Handler
    const result = await handler(args, currentCtx);

    // Fast-Return on Error
    if (result?.isError) return result;

    // Fast-Return for Pager Output (less/more view)
    if (result?.pagerContent) {
        return result; 
    }

    // Fast-Return for Injected React Components (top, matrix, ping)
    if (result?.component) {
        return result; 
    }

    // Fast-Return for Editor Overlays (gedit, vim) - The crucial fix!
    if (result?.editorTarget) {
        return result;
    }

    lastOutput = result?.text || '';
    isHTML = result?.isHTML || false;

    // Handle File Redirection Output (>)
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