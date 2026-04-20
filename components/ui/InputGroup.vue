<script setup lang="ts">
import { cn } from '~/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn(
      'relative flex items-center border border-input bg-background text-foreground',
      'focus-within:ring-1 focus-within:ring-ring',
      props.class
    )"
  >
    <slot />
  </div>
</template>
