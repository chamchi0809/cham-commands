import * as vscode from "vscode";
import type { Command } from "../types";

const STORAGE_KEY = "chamCommands";

export class StorageManager {
  constructor(private state: vscode.Memento) {}

  getCommands(): Command[] {
    const raw = this.state.get<Command[]>(STORAGE_KEY, []);
    return raw.sort((a, b) => a.order - b.order);
  }

  async saveCommand(command: Command): Promise<void> {
    const commands = this.state.get<Command[]>(STORAGE_KEY, []);
    const index = commands.findIndex((c) => c.id === command.id);
    if (index >= 0) {
      commands[index] = command;
    } else {
      command.order = commands.length;
      commands.push(command);
    }
    await this.state.update(STORAGE_KEY, commands);
  }

  async deleteCommand(id: string): Promise<void> {
    const commands = this.state.get<Command[]>(STORAGE_KEY, []);
    const filtered = commands.filter((c) => c.id !== id);
    filtered.forEach((c, i) => (c.order = i));
    await this.state.update(STORAGE_KEY, filtered);
  }

  async reorderCommands(ids: string[]): Promise<void> {
    const commands = this.state.get<Command[]>(STORAGE_KEY, []);
    const map = new Map(commands.map((c) => [c.id, c]));
    const reordered: Command[] = [];
    for (let i = 0; i < ids.length; i++) {
      const cmd = map.get(ids[i]);
      if (cmd) {
        cmd.order = i;
        reordered.push(cmd);
      }
    }
    await this.state.update(STORAGE_KEY, reordered);
  }

  async importCommands(newCommands: Command[]): Promise<void> {
    const existing = this.state.get<Command[]>(STORAGE_KEY, []);
    let order = existing.length;
    for (const cmd of newCommands) {
      cmd.order = order++;
      existing.push(cmd);
    }
    await this.state.update(STORAGE_KEY, existing);
  }

  async togglePin(id: string): Promise<void> {
    const commands = this.state.get<Command[]>(STORAGE_KEY, []);
    const cmd = commands.find((c) => c.id === id);
    if (cmd) {
      cmd.pinned = !cmd.pinned;
      await this.state.update(STORAGE_KEY, commands);
    }
  }

  getCommand(id: string): Command | undefined {
    const commands = this.state.get<Command[]>(STORAGE_KEY, []);
    return commands.find((c) => c.id === id);
  }
}
