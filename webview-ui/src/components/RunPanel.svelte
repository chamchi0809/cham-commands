<script lang="ts">
  import type { CommandArgument } from "../lib/types";
  import ToggleSwitch from "./ToggleSwitch.svelte";

  let {
    commandString,
    arguments: args,
    onRun,
    onCancel,
  }: {
    commandString: string;
    arguments: CommandArgument[];
    onRun: (values: Record<string, string>) => void;
    onCancel: () => void;
  } = $props();

  function initValues() {
    const init: Record<string, string> = {};
    for (const arg of args) {
      init[arg.id] = arg.defaultValue;
    }
    return init;
  }

  let values = $state<Record<string, string>>(initValues());

  let preview = $derived.by(() => {
    let resolved = commandString;
    const handled = new Set<string>();

    for (const arg of args) {
      const value = values[arg.id] ?? arg.defaultValue;
      const placeholder = `{{${arg.displayName}}}`;

      if (resolved.includes(placeholder)) {
        handled.add(arg.id);
        if (arg.type === "boolean") {
          resolved = resolved.replaceAll(placeholder, value === "true" ? arg.name : "");
        } else {
          resolved = resolved.replaceAll(placeholder, value);
        }
      }
    }

    for (const arg of args) {
      if (handled.has(arg.id)) continue;
      const value = values[arg.id] ?? arg.defaultValue;
      if (arg.type === "boolean" && value === "true" && arg.name) {
        resolved += ` ${arg.name}`;
      } else if (arg.type === "string" && value) {
        resolved += arg.name ? ` ${arg.name} ${value}` : ` ${value}`;
      }
    }

    return resolved.replace(/\s+/g, " ").trim();
  });

  function handleRun() {
    onRun({ ...values });
  }
</script>

<div class="panel">
  {#if args.length > 0}
    <div class="args">
      {#each args as arg (arg.id)}
        <div class="arg-row">
          <span class="arg-name">{arg.displayName}</span>
          {#if arg.type === "boolean"}
            <ToggleSwitch
              checked={values[arg.id] === "true"}
              onToggle={(v) => (values[arg.id] = String(v))}
            />
          {:else}
            <input
              type="text"
              value={values[arg.id] ?? ""}
              oninput={(e) => (values[arg.id] = e.currentTarget.value)}
              placeholder={arg.displayName}
            />
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <div class="preview">
    <span class="preview-label">$</span>
    <code class="preview-cmd">{preview}</code>
  </div>

  <div class="btn-row">
    <button onclick={handleRun}>Run</button>
    <button class="secondary" onclick={onCancel}>Cancel</button>
  </div>
</div>

<style>
  .panel {
    padding: 6px 6px 6px 26px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-top: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
  }

  .args {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .arg-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .arg-name {
    font-size: 12px;
    color: var(--vscode-foreground);
    min-width: 60px;
    flex-shrink: 0;
  }

  .arg-row input {
    flex: 1;
    min-width: 0;
  }

  .preview {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 8px;
    background: var(--vscode-terminal-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-widget-border, var(--vscode-panel-border));
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
    line-height: 1.4;
  }

  .preview-label {
    color: var(--vscode-terminal-ansiBrightGreen, var(--vscode-descriptionForeground));
    flex-shrink: 0;
    user-select: none;
  }

  .preview-cmd {
    color: var(--vscode-terminal-foreground, var(--vscode-foreground));
    word-break: break-all;
  }

  .btn-row {
    display: flex;
    gap: 4px;
  }
</style>
