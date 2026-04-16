<script lang="ts">
  import { onMount } from "svelte";
  import { vscode } from "./lib/vscode";
  import type { Command, ExtensionToWebviewMessage } from "./lib/types";
  import CommandList from "./components/CommandList.svelte";
  import CommandEditor from "./components/CommandEditor.svelte";
  import ImportDialog from "./components/ImportDialog.svelte";
  import EmptyState from "./components/EmptyState.svelte";

  type View = "list" | "editor" | "import";

  let commands = $state<Command[]>([]);
  let currentView = $state<View>("list");
  let editingId = $state<string | null>(null);
  let editingName = $state("");
  let editingCmd = $state("");
  let editingArgs = $state<Command["arguments"]>([]);
  let editingOrder = $state(0);
  let packageJsonScripts = $state<Record<string, string>>({});
  let notice = $state<string | null>(null);

  let hasCommands = $derived(commands.length > 0);

  function showNotice(text: string) {
    notice = text;
    setTimeout(() => (notice = null), 3000);
  }

  function onAddCommand() {
    editingId = null;
    editingName = "";
    editingCmd = "";
    editingArgs = [];
    editingOrder = 0;
    currentView = "editor";
  }

  function onEditCommand(command: Command) {
    editingId = command.id;
    editingName = command.name;
    editingCmd = command.command;
    editingArgs = JSON.parse(JSON.stringify(command.arguments));
    editingOrder = command.order;
    currentView = "editor";
  }

  function onEditorDone() {
    editingId = null;
    currentView = "list";
  }

  function onImportDone() {
    currentView = "list";
  }

  onMount(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data as ExtensionToWebviewMessage;
      switch (msg.type) {
        case "commands":
          commands = msg.data;
          break;
        case "packageJsonScripts":
          packageJsonScripts = msg.data;
          currentView = "import";
          break;
        case "noPackageJson":
          showNotice("No scripts found in package.json");
          break;
        case "error":
          showNotice(msg.message);
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    vscode.postMessage({ command: "ready" });

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });
</script>

<div class="container">
  {#if notice}
    <div class="notice">{notice}</div>
  {/if}

  {#if currentView === "list"}
    {#if hasCommands}
      <CommandList
        {commands}
        onEdit={onEditCommand}
        onAdd={onAddCommand}
      />
    {:else}
      <EmptyState onAdd={onAddCommand} />
    {/if}
  {:else if currentView === "editor"}
    {#key editingId}
      <CommandEditor
        initialId={editingId ?? undefined}
        initialName={editingName}
        initialCommand={editingCmd}
        initialArguments={editingArgs}
        initialOrder={editingOrder}
        isEditing={editingId !== null}
        onDone={onEditorDone}
      />
    {/key}
  {:else if currentView === "import"}
    <ImportDialog
      scripts={packageJsonScripts}
      onDone={onImportDone}
    />
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .notice {
    padding: 6px 10px;
    background: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    color: var(--vscode-foreground);
    font-size: 12px;
  }
</style>
