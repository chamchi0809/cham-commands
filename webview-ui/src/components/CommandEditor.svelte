<script lang="ts">
  import { vscode } from "../lib/vscode";
  import type { Command, CommandArgument } from "../lib/types";
  import ArgumentEditor from "./ArgumentEditor.svelte";

  let {
    initialId = crypto.randomUUID(),
    initialName = "",
    initialCommand = "",
    initialArguments = [] as CommandArgument[],
    initialOrder = 0,
    isEditing = false,
    onDone,
  }: {
    initialId?: string;
    initialName?: string;
    initialCommand?: string;
    initialArguments?: CommandArgument[];
    initialOrder?: number;
    isEditing?: boolean;
    onDone: () => void;
  } = $props();

  let id = $state(initialId);
  let name = $state(initialName);
  let cmd = $state(initialCommand);
  let args = $state<CommandArgument[]>(JSON.parse(JSON.stringify(initialArguments)));
  let order = $state(initialOrder);

  let isValid = $derived(name.trim() !== "" && cmd.trim() !== "");

  function addArgument() {
    args = [
      ...args,
      {
        id: crypto.randomUUID(),
        displayName: "",
        name: "",
        type: "string",
        defaultValue: "",
      },
    ];
  }

  function removeArgument(argId: string) {
    args = args.filter((a) => a.id !== argId);
  }

  function updateArgument(argId: string, updated: Partial<CommandArgument>) {
    args = args.map((a) => (a.id === argId ? { ...a, ...updated } : a));
  }

  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);
  let draggingAllowed = $state(false);

  function onHandleMouseDown() {
    draggingAllowed = true;
  }

  function onDragStart(event: DragEvent, index: number) {
    if (!draggingAllowed) {
      event.preventDefault();
      return;
    }
    dragIndex = index;
  }

  function onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    dropIndex = index;
  }

  function onDragEnd() {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const next = [...args];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      args = next;
    }
    dragIndex = null;
    dropIndex = null;
    draggingAllowed = false;
  }

  function save() {
    if (!isValid) return;
    const command: Command = {
      id,
      name: name.trim(),
      command: cmd.trim(),
      arguments: args.filter((a) => a.displayName.trim() !== ""),
      order,
    };
    vscode.postMessage({ command: "saveCommand", data: command });
    onDone();
  }
</script>

<div class="editor">
  <div class="header">
    <span class="title">{isEditing ? "Edit Command" : "New Command"}</span>
  </div>

  <div class="field">
    <label for="cmd-name">Name</label>
    <input
      id="cmd-name"
      type="text"
      bind:value={name}
      placeholder="My Command"
    />
  </div>

  <div class="field">
    <label for="cmd-command">Command</label>
    <input
      id="cmd-command"
      type="text"
      bind:value={cmd}
      placeholder="npm run build {{verbose}}"
    />
  </div>

  <hr class="divider" />

  <div class="args-section">
    <div class="args-header">
      <span class="args-label">Arguments</span>
      <button class="icon-btn" onclick={addArgument} title="Add Argument">+</button>
    </div>

    {#if args.length === 0}
      <p class="no-args">No arguments</p>
    {:else}
      <div class="args-list">
        {#each args as arg, index (arg.id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="arg-drag"
            class:drag-over={dropIndex === index && dragIndex !== index}
            draggable="true"
            ondragstart={(e) => onDragStart(e, index)}
            ondragover={(e) => onDragOver(e, index)}
            ondragend={onDragEnd}
          >
            <div class="drag-handle" onmousedown={onHandleMouseDown} title="Drag to reorder">{"\u2261"}</div>
            <ArgumentEditor
              argument={arg}
              onUpdate={(updated) => updateArgument(arg.id, updated)}
              onRemove={() => removeArgument(arg.id)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <hr class="divider" />

  <div class="btn-row">
    <button onclick={save} disabled={!isValid}>Save</button>
    <button class="secondary" onclick={onDone}>Cancel</button>
  </div>
</div>

<style>
  .editor {
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

  .field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .args-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .args-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .args-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .arg-drag {
    display: flex;
    gap: 0;
    align-items: stretch;
  }

  .arg-drag :global(.arg) {
    flex: 1;
    min-width: 0;
  }

  .drag-handle {
    display: flex;
    align-items: center;
    padding: 0 4px;
    cursor: grab;
    color: var(--vscode-descriptionForeground);
    font-size: 14px;
    user-select: none;
    flex-shrink: 0;
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    border-right: none;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .drag-over {
    border-top: 2px solid var(--vscode-focusBorder);
  }

  .no-args {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    padding: 4px 0;
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
