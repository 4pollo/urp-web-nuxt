<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <span
    :class="cn(
      'flex h-8 w-8 items-center justify-center text-muted-foreground',
      props.class
    )"
  >
    <MoreHorizontal class="h-4 w-4" />
    <span class="sr-only">更多页面</span>
  </span>
</template>
