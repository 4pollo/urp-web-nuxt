<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { InputGroupButtonProps } from "./utils"
import { cn } from "@/lib/utils"
import { inputGroupButtonVariants } from "./utils"

const props = withDefaults(defineProps<InputGroupButtonProps & {
  class?: HTMLAttributes["class"]
}>(), {
  size: "xs",
  variant: "ghost",
})
</script>

<template>
  <Button
    :data-size="props.size"
    :variant="props.variant"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Button>
</template>
