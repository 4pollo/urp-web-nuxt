<script setup lang="ts">
import Dialog from '~/components/ui/Dialog.vue';
import DialogHeader from '~/components/ui/DialogHeader.vue';
import DialogTitle from '~/components/ui/DialogTitle.vue';
import DialogDescription from '~/components/ui/DialogDescription.vue';
import DialogFooter from '~/components/ui/DialogFooter.vue';

interface Props {
  open: boolean;
  pending?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pending: false,
  title: '确认操作',
  description: '确定要继续吗？',
  confirmLabel: '确认',
  cancelLabel: '取消',
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [];
}>();

function handleOpenChange(value: boolean) {
  if (!props.pending) {
    emit('update:open', value);
  }
}

function handleConfirm() {
  if (!props.pending) {
    emit('confirm');
  }
}

function handleCancel() {
  if (!props.pending) {
    emit('update:open', false);
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogHeader>
      <DialogTitle>{{ props.title }}</DialogTitle>
      <DialogDescription>{{ props.description }}</DialogDescription>
    </DialogHeader>
    <DialogFooter class="mt-6">
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-border bg-background px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        :disabled="props.pending"
        @click="handleCancel"
      >
        {{ props.cancelLabel }}
      </button>
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-destructive bg-destructive px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        :disabled="props.pending"
        @click="handleConfirm"
      >
        {{ props.pending ? '处理中...' : props.confirmLabel }}
      </button>
    </DialogFooter>
  </Dialog>
</template>
