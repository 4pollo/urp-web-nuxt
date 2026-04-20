<script setup lang="ts">
import type { DialogCloseProps } from "reka-ui"
import { DialogClose as DialogClosePrimitive } from "reka-ui"

const props = defineProps<DialogCloseProps>()
</script>

<template>
  <DialogClosePrimitive v-bind="props">
    <slot />
  </DialogClosePrimitive>
</template>
