<script lang="ts">
  import { vscode } from "../lib/vscode";

  let { onAdd }: { onAdd: () => void } = $props();

  function onImport() {
    vscode.postMessage({ command: "importPackageJson" });
  }
</script>

<div class="empty">
  <p class="message">No commands yet</p>
  <p class="sub">Add a command or import from package.json</p>
  <div class="btn-row">
    <button onclick={onAdd}>Add Command</button>
    <button class="secondary" onclick={onImport}>Import from package.json</button>
  </div>
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 12px;
    text-align: center;
  }

  .message {
    font-size: 13px;
    color: var(--vscode-foreground);
  }

  .sub {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }

  .btn-row {
    display: flex;
    gap: 6px;
  }
</style>
