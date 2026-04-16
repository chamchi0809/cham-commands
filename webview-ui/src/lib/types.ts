export interface CommandArgument {
  id: string;
  displayName: string;
  name: string;
  type: "boolean" | "string";
  defaultValue: string;
}

export interface Command {
  id: string;
  name: string;
  command: string;
  arguments: CommandArgument[];
  order: number;
  pinned?: boolean;
}

export type ExtensionToWebviewMessage =
  | { type: "commands"; data: Command[] }
  | { type: "packageJsonScripts"; data: Record<string, string> }
  | { type: "noPackageJson" }
  | { type: "error"; message: string };
