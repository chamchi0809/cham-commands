import * as vscode from "vscode";
import type { StorageManager } from "../storage/storageManager";

export function runCommand(
  storage: StorageManager,
  commandId: string,
  argumentValues: Record<string, string>
): void {
  const command = storage.getCommand(commandId);
  if (!command) {
    vscode.window.showErrorMessage("Command not found.");
    return;
  }

  let resolved = command.command;
  const handledArgs = new Set<string>();

  for (const arg of command.arguments) {
    const value = argumentValues[arg.id] ?? arg.defaultValue;
    const placeholder = `{{${arg.displayName}}}`;

    if (resolved.includes(placeholder)) {
      handledArgs.add(arg.id);
      if (arg.type === "boolean") {
        resolved = resolved.replaceAll(placeholder, value === "true" ? arg.name : "");
      } else {
        resolved = resolved.replaceAll(placeholder, value);
      }
    }
  }

  for (const arg of command.arguments) {
    if (handledArgs.has(arg.id)) {
      continue;
    }
    const value = argumentValues[arg.id] ?? arg.defaultValue;
    if (arg.type === "boolean" && value === "true" && arg.name) {
      resolved += ` ${arg.name}`;
    } else if (arg.type === "string" && value) {
      resolved += arg.name ? ` ${arg.name} ${value}` : ` ${value}`;
    }
  }

  resolved = resolved.replace(/\s+/g, " ").trim();

  const terminal = vscode.window.createTerminal({ name: `Cham: ${command.name}` });
  terminal.show();
  terminal.sendText(resolved);
}
