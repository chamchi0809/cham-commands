import * as vscode from "vscode";
import { CommandPanelProvider } from "./providers/commandPanelProvider";
import { StorageManager } from "./storage/storageManager";

export function activate(context: vscode.ExtensionContext): void {
  const storage = new StorageManager(context.workspaceState);
  const provider = new CommandPanelProvider(context.extensionUri, storage);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("chamCommandsPanel", provider),

    vscode.commands.registerCommand("cham-commands.openPanel", () => {
      vscode.commands.executeCommand("chamCommandsPanel.focus");
    }),

    vscode.commands.registerCommand("cham-commands.importPackageJson", () => {
      provider.handleImportPackageJson();
    })
  );
}

export function deactivate(): void {}
