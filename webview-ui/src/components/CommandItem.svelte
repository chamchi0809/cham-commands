<script lang="ts">
  import type { Command } from "../lib/types";
  import RunPanel from "./RunPanel.svelte";

  let {
    command,
    onEdit,
    onDelete,
    onTogglePin,
    onRun,
  }: {
    command: Command;
    onEdit: () => void;
    onDelete: () => void;
    onTogglePin: () => void;
    onRun: (args: Record<string, string>) => void;
  } = $props();

  let expanded = $state(false);
  let confirmDelete = $state(false);

  function handleDelete() {
    if (confirmDelete) {
      onDelete();
      confirmDelete = false;
    } else {
      confirmDelete = true;
      setTimeout(() => (confirmDelete = false), 3000);
    }
  }

  function handleRun(args: Record<string, string>) {
    onRun(args);
    expanded = false;
  }
</script>

<div class="item">
  <div class="row">
    <button
      class="icon-btn expand-btn"
      onclick={() => (expanded = !expanded)}
      title={expanded ? "Collapse" : "Expand"}
    >
      {expanded ? "\u25BE" : "\u25B8"}
    </button>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="info" ondblclick={onEdit}>
      <span class="name">{command.name}</span>
      <span class="cmd">{command.command}</span>
    </div>
    <div class="actions">
      <button
        class="icon-btn"
        class:pinned={command.pinned}
        onclick={onTogglePin}
        title={command.pinned ? "Unpin" : "Pin"}
      ><span class="pin-icon"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2z"/></svg></span></button>
      <button
        class="icon-btn"
        onclick={() => { expanded = true; }}
        title="Run"
      >{"\u25B6"}</button>
      <button class="icon-btn" onclick={onEdit} title="Edit">{"\u270E"}</button>
      <button
        class="icon-btn"
        class:danger-text={confirmDelete}
        onclick={handleDelete}
        title={confirmDelete ? "Confirm delete" : "Delete"}
      >{confirmDelete ? "!" : "\u00D7"}</button>
    </div>
  </div>

  {#if expanded}
    <RunPanel
      commandString={command.command}
      arguments={command.arguments}
      onRun={handleRun}
      onCancel={() => (expanded = false)}
    />
  {/if}
</div>

<style>
  .item {
    background: var(--vscode-list-hoverBackground, transparent);
    border: 1px solid transparent;
  }

  .item:hover {
    border-color: var(--vscode-widget-border, var(--vscode-panel-border));
  }

  .row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    min-height: 28px;
  }

  .expand-btn {
    font-size: 10px;
    width: 16px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
    cursor: default;
  }

  .name {
    font-size: 13px;
    color: var(--vscode-foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cmd {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--vscode-editor-font-family);
  }

  .actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .pin-icon {
    display: flex;
    align-items: center;
    opacity: 0.4;
  }

  .pinned .pin-icon {
    opacity: 1;
    color: var(--vscode-foreground);
  }

  .danger-text {
    color: var(--vscode-errorForeground) !important;
    font-weight: bold;
  }
</style>
