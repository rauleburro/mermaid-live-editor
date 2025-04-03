<script lang="ts">
  import { Button } from '$/components/ui/button';
  import SparkleIcon from '~icons/mdi/sparkles-outline';
  import { createEventDispatcher } from 'svelte';

  let promptValue = $state('');
  const dispatch = createEventDispatcher<{ submit: string }>();

  function handleGenerateClick() {
    if (promptValue.trim()) {
      dispatch('submit', promptValue);
    }
    // Optional: Clear the input after dispatching
    // promptValue = '';
  }
</script>

<div class="flex items-center gap-2 border-b p-2">
  <input
    type="text"
    bind:value={promptValue}
    placeholder="Enter your prompt here..."
    class="flex-grow rounded border bg-background p-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    onkeydown={(e) => e.key === 'Enter' && handleGenerateClick()} />
  <Button onclick={handleGenerateClick} size="sm" variant="outline" title="Generate Diagram">
    <SparkleIcon />
  </Button>
</div>
