<script setup lang="ts">
import type { DialogDescriptionProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogDescription as DialogDescriptionPrimitive, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DialogDescriptionPrimitive
    v-bind="forwardedProps"
    :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot />
  </DialogDescriptionPrimitive>
</template>
