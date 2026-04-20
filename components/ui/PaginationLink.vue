<script setup lang="ts">
import { cn } from '~/lib/utils';

interface Props {
  isActive?: boolean;
  class?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    :aria-current="props.isActive ? 'page' : undefined"
    :class="cn(
      'inline-flex h-9 items-center justify-center whitespace-nowrap border px-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      props.isActive
        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
        : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
      props.class
    )"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
