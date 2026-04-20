<script setup lang="ts">
import {
  AlertDialogRoot,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from 'radix-vue';
import { AlertTriangle } from 'lucide-vue-next';

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
</script>

<template>
  <AlertDialogRoot :open="props.open" @update:open="handleOpenChange">
    <AlertDialogPortal>
      <AlertDialogOverlay
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-border bg-background text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 sm:max-w-md"
      >
        <!-- Header -->
        <div class="border-b border-border bg-muted/20 px-6 py-4 text-left">
          <div class="flex items-center gap-3">
            <div
              class="flex h-6 w-6 items-center justify-center border border-destructive/40 bg-destructive/10 text-destructive"
            >
              <AlertTriangle :size="16" />
            </div>
            <AlertDialogTitle class="text-lg font-semibold">
              {{ props.title }}
            </AlertDialogTitle>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 pb-4">
          <div
            class="flex flex-col space-y-2 border border-border bg-card px-5 py-4 text-center sm:text-left"
          >
            <AlertDialogDescription class="text-sm text-muted-foreground">
              {{ props.description }}
            </AlertDialogDescription>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-border bg-muted/20 px-6 py-4">
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel
              :disabled="props.pending"
              class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-border bg-background px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {{ props.cancelLabel }}
            </AlertDialogCancel>
            <button
              type="button"
              :disabled="props.pending"
              class="inline-flex h-10 items-center justify-center whitespace-nowrap border border-destructive bg-destructive px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              @click="handleConfirm"
            >
              {{ props.pending ? '处理中...' : props.confirmLabel }}
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
