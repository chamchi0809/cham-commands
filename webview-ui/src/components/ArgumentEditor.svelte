<script lang="ts">
  import type { CommandArgument } from "../lib/types";
  import ToggleSwitch from "./ToggleSwitch.svelte";

  let {
    argument,
    onUpdate,
    onRemove,
  }: {
    argument: CommandArgument;
    onUpdate: (updated: Partial<CommandArgument>) => void;
    onRemove: () => void;
  } = $props();

  function handleTypeChange(newType: "boolean" | "string") {
    onUpdate({
      type: newType,
      defaultValue: newType === "boolean" ? "false" : "",
    });
  }
</script>

<div class="arg">
  <div class="arg-top">
    <input
      type="text"
      value={argument.displayName}
      oninput={(e) => onUpdate({ displayName: e.currentTarget.value })}
      placeholder="Display Name"
      class="display-name-input"
    />
    <select
      value={argument.type}
      onchange={(e) => handleTypeChange(e.currentTarget.value as "boolean" | "string")}
    >
      <option value="string">String</option>
      <option value="boolean">Boolean</option>
    </select>
    <button class="icon-btn" onclick={onRemove} title="Remove">{"\u00D7"}</button>
  </div>

  <div class="arg-row">
    <span class="row-label">Name:</span>
    <input
      type="text"
      value={argument.name}
      oninput={(e) => onUpdate({ name: e.currentTarget.value })}
      placeholder="--flag or leave empty"
      class="name-input"
    />
  </div>

  <div class="arg-row">
    <span class="row-label">Default:</span>
    {#if argument.type === "boolean"}
      <ToggleSwitch
        checked={argument.defaultValue === "true"}
        onToggle={(v) => onUpdate({ defaultValue: String(v) })}
      />
    {:else}
      <input
        type="text"
        value={argument.defaultValue}
        oninput={(e) => onUpdate({ defaultValue: e.currentTarget.value })}
        placeholder="default value"
      />
    {/if}
  </div>
</div>

<style>
  .arg {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
  }

  .arg-top {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .display-name-input {
    flex: 1;
    min-width: 0;
  }

  select {
    width: auto;
    flex-shrink: 0;
  }

  .arg-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .row-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    flex-shrink: 0;
    min-width: 46px;
  }

  .name-input {
    flex: 1;
    min-width: 0;
  }

  .arg-row input {
    flex: 1;
    min-width: 0;
  }
</style>
