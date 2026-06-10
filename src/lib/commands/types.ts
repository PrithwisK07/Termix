import React from 'react';

export interface TerminalTheme {
  name: string;
  bg: string;
  fg: string;
}

export interface CommandContext {
  cwd: string;
  setCwd: (path: string) => void;
  clearTerminal: () => void;
  stdin?: string;
  history: any[];
  aliases: Record<string, string>;
  setAlias: (name: string, cmd: string) => void;
  setTheme: (theme: TerminalTheme) => void;
}

export interface CommandOutput {
  text: string;
  isError?: boolean;
  isHTML?: boolean;
  component?: React.ReactNode;
  pagerContent?: string;
  editorTarget?: {
    path: string;
    content: string;
    type: 'vim' | 'gedit' | 'mailer';
  };
}

export type CommandHandler = (
  args: string[], 
  ctx: CommandContext
) => CommandOutput | void | Promise<CommandOutput | void>;