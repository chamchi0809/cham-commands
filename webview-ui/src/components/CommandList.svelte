<script lang="ts">
  import { vscode } from "../lib/vscode";
  import type { Command } from "../lib/types";
  import CommandItem from "./CommandItem.svelte";

  let {
    commands,
    onEdit,
    onAdd,
  }: {
    commands: Command[];
    onEdit: (cmd: Command) => void;
    onAdd: () => void;
  } = $props();

  function onImport() {
    vscode.postMessage({ command: "importPackageJson" });
  }

  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);

  function onDragStart(index: number) {
    dragIndex = index;
  }

  function onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    dropIndex = index;
  }

  function onDragEnd() {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const ids = sorted.map((c) => c.id);
      const [moved] = ids.splice(dragIndex, 1);
      ids.splice(dropIndex, 0, moved);
      vscode.postMessage({ command: "reorderCommands", data: { ids } });
    }
    dragIndex = null;
    dropIndex = null;
  }

  function onDelete(id: string) {
    vscode.postMessage({ command: "deleteCommand", data: { id } });
  }

  function onRun(id: string, argumentValues: Record<string, string>) {
    vscode.postMessage({ command: "runCommand", data: { id, argumentValues } });
  }

  function onTogglePin(id: string) {
    vscode.postMessage({ command: "togglePin", data: { id } });
  }

  let sorted = $derived(
    [...commands].sort((a, b) => {
      const ap = a.pinned ? 0 : 1;
      const bp = b.pinned ? 0 : 1;
      return ap - bp || a.order - b.order;
    })
  );
</script>

<div class="list">
  <div class="header">
    <span class="title">Commands</span>
    <div class="header-actions">
      <button class="text-btn" onclick={onImport}>Import</button>
      <button class="icon-btn" onclick={onAdd} title="Add Command">+</button>
    </div>
  </div>

  <div class="items">
    {#each sorted as command, index (command.id)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="drag-wrapper"
        class:drag-over={dropIndex === index && dragIndex !== index}
        draggable="true"
        ondragstart={() => onDragStart(index)}
        ondragover={(e) => onDragOver(e, index)}
        ondragend={onDragEnd}
      >
        <CommandItem
          {command}
          onEdit={() => onEdit(command)}
          onDelete={() => onDelete(command.id)}
          onTogglePin={() => onTogglePin(command.id)}
          onRun={(args) => onRun(command.id, args)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .text-btn {
    font-size: 11px;
    color: var(--vscode-textLink-foreground);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
  }

  .text-btn:hover {
    color: var(--vscode-textLink-activeForeground);
    text-decoration: underline;
  }

  .title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-sideBarSectionHeader-foreground, var(--vscode-foreground));
    font-weight: 700;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .drag-wrapper {
    cursor: grab;
  }

  .drag-wrapper:active {
    cursor: grabbing;
  }

  .drag-over {
    border-top: 2px solid var(--vscode-focusBorder);
  }
</style>
