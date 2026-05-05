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
}

export type CommandHandler = (
  args: string[], 
  ctx: CommandContext
) => CommandOutput | void | Promise<CommandOutput | void>;