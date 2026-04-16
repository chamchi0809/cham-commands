import * as vscode from "vscode";
import * as crypto from "crypto";
import type { StorageManager } from "../storage/storageManager";
import type { WebviewToExtensionMessage } from "../types";
import { runCommand } from "../commands/runCommand";
import { importPackageJson } from "../commands/importPackageJson";

function getNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

export class CommandPanelProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;

  constructor(
    private extensionUri: vscode.Uri,
    private storage: StorageManager
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist"),
      ],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((msg: WebviewToExtensionMessage) => {
      this.handleMessage(msg);
    });
  }

  private async handleMessage(msg: WebviewToExtensionMessage): Promise<void> {
    switch (msg.command) {
      case "ready":
      case "getCommands":
        this.sendCommands();
        break;

      case "saveCommand":
        await this.storage.saveCommand(msg.data);
        this.sendCommands();
        break;

      case "deleteCommand":
        await this.storage.deleteCommand(msg.data.id);
        this.sendCommands();
        break;

      case "reorderCommands":
        await this.storage.reorderCommands(msg.data.ids);
        this.sendCommands();
        break;

      case "runCommand":
        runCommand(this.storage, msg.data.id, msg.data.argumentValues);
        break;

      case "togglePin":
        await this.storage.togglePin(msg.data.id);
        this.sendCommands();
        break;

      case "importPackageJson":
        await this.handleImportPackageJson();
        break;
    }
  }

  async handleImportPackageJson(): Promise<void> {
    const scripts = await importPackageJson();
    if (scripts && Object.keys(scripts).length > 0) {
      this.view?.webview.postMessage({ type: "packageJsonScripts", data: scripts });
    } else {
      this.view?.webview.postMessage({ type: "noPackageJson" });
    }
  }

  private sendCommands(): void {
    const commands = this.storage.getCommands();
    this.view?.webview.postMessage({ type: "commands", data: commands });
  }

  private getHtml(webview: vscode.Webview): string {
    const distPath = vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist");

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distPath, "assets", "index.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distPath, "assets", "index.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
  <link rel="stylesheet" href="${styleUri}">
  <title>Cham Commands</title>
</head>
<body>
  <div id="app"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
