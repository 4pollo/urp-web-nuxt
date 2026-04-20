<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

interface Props {
  disabled?: boolean;
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
    :disabled="props.disabled"
    aria-label="上一页"
    :class="cn(
      'inline-flex h-9 items-center justify-center gap-1 whitespace-nowrap border border-border bg-background px-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      props.class
    )"
    @click="emit('click')"
  >
    <ChevronLeft :size="16" />
    <span>上一页</span>
  </button>
</template>
