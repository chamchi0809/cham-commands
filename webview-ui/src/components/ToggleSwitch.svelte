<script lang="ts">
  let { checked, onToggle }: { checked: boolean; onToggle: (val: boolean) => void } = $props();
</script>

<button
  class="toggle"
  class:on={checked}
  role="switch"
  aria-checked={checked}
  aria-label="Toggle"
  onclick={() => onToggle(!checked)}
>
  <span class="thumb"></span>
</button>

<style>
  .toggle {
    position: relative;
    width: 32px;
    height: 18px;
    padding: 0;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, var(--vscode-widget-border));
    cursor: pointer;
    flex-shrink: 0;
  }

  .toggle.on {
    background: var(--vscode-button-background);
    border-color: var(--vscode-button-background);
  }

  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: var(--vscode-foreground);
    transition: left 0.15s;
  }

  .toggle.on .thumb {
    left: 16px;
    background: var(--vscode-button-foreground);
  }
</style>
