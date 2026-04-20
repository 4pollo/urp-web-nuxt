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
      'flex h-11 items-center justify-center px-2 text-muted-foreground',
      props.class
    )"
  >
    <slot />
  </div>
</template>
