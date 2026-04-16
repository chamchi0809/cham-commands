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

export type WebviewToExtensionMessage =
  | { command: "getCommands" }
  | { command: "saveCommand"; data: Command }
  | { command: "deleteCommand"; data: { id: string } }
  | { command: "reorderCommands"; data: { ids: string[] } }
  | { command: "runCommand"; data: { id: string; argumentValues: Record<string, string> } }
  | { command: "togglePin"; data: { id: string } }
  | { command: "importPackageJson" }
  | { command: "ready" };

export type ExtensionToWebviewMessage =
  | { type: "commands"; data: Command[] }
  | { type: "packageJsonScripts"; data: Record<string, string> }
  | { type: "noPackageJson" }
  | { type: "error"; message: string };
