// src/lib/commands/types.ts
import React from 'react';

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
  pagerContent?: string; // NEW: Tells the engine to open the pager
}

export type CommandHandler = (
  args: string[], 
  ctx: CommandContext
) => CommandOutput | void | Promise<CommandOutput | void>;