<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <nav
    data-slot="pagination"
    :class="cn('mx-auto flex w-full justify-center', props.class)"
  >
    <slot />
  </nav>
</template>
