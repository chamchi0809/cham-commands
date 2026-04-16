<script lang="ts">
  import { vscode } from "../lib/vscode";
  import type { Command } from "../lib/types";

  let {
    scripts,
    onDone,
  }: {
    scripts: Record<string, string>;
    onDone: () => void;
  } = $props();

  let entries = $derived(Object.entries(scripts));
  let selected = $state<Set<string>>(new Set());

  let allSelected = $derived(selected.size === entries.length);

  function toggleAll() {
    if (allSelected) {
      selected = new Set();
    } else {
      selected = new Set(entries.map(([k]) => k));
    }
  }

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    selected = next;
  }

  function importSelected() {
    const commands: Command[] = [];
    for (const [name, value] of entries) {
      if (!selected.has(name)) continue;
      commands.push({
        id: crypto.randomUUID(),
        name,
        command: value,
        arguments: [],
        order: 0,
      });
    }
    if (commands.length > 0) {
      for (const cmd of commands) {
        vscode.postMessage({ command: "saveCommand", data: cmd });
      }
    }
    onDone();
  }
</script>

<div class="dialog">
  <div class="header">
    <span class="title">Import from package.json</span>
  </div>

  <div class="select-all">
    <label class="check-label">
      <input type="checkbox" checked={allSelected} onchange={toggleAll} />
      <span>Select All</span>
    </label>
  </div>

  <div class="script-list">
    {#each entries as [name, value] (name)}
      <label class="script-item">
        <input
          type="checkbox"
          checked={selected.has(name)}
          onchange={() => toggle(name)}
        />
        <div class="script-info">
          <span class="script-name">{name}</span>
          <span class="script-value">{value}</span>
        </div>
      </label>
    {/each}
  </div>

  <div class="btn-row">
    <button onclick={importSelected} disabled={selected.size === 0}>
      Import ({selected.size})
    </button>
    <button class="secondary" onclick={onDone}>Cancel</button>
  </div>
</div>

<style>
  .dialog {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .header {
    padding: 4px 0;
  }

  .title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-sideBarSectionHeader-foreground, var(--vscode-foreground));
    font-weight: 700;
  }

  .select-all {
    padding: 2px 0;
  }

  .check-label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 12px;
    text-transform: none;
    letter-spacing: normal;
    margin-bottom: 0;
  }

  .check-label input[type="checkbox"] {
    width: auto;
    cursor: pointer;
  }

  .script-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 300px;
    overflow-y: auto;
  }

  .script-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 4px 6px;
    cursor: pointer;
    text-transform: none;
    letter-spacing: normal;
    margin-bottom: 0;
  }

  .script-item:hover {
    background: var(--vscode-list-hoverBackground);
  }

  .script-item input[type="checkbox"] {
    width: auto;
    margin-top: 2px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .script-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .script-name {
    font-size: 13px;
    color: var(--vscode-foreground);
  }

  .script-value {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    font-family: var(--vscode-editor-font-family);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-row {
    display: flex;
    gap: 4px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
