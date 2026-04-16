import * as vscode from "vscode";

export async function importPackageJson(): Promise<Record<string, string> | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }

  const pkgPath = vscode.Uri.joinPath(workspaceFolders[0].uri, "package.json");
  try {
    const content = await vscode.workspace.fs.readFile(pkgPath);
    const pkg = JSON.parse(Buffer.from(content).toString("utf-8"));
    return pkg.scripts ?? null;
  } catch {
    return null;
  }
}
