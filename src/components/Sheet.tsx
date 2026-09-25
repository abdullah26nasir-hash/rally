import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/** Bottom sheet on phones, centred panel on larger screens. */
export function Sheet({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 overlay" />
        <Dialog.Content className="sheet fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[440px] max-h-[88dvh] overflow-y-auto bg-surface-2 rounded-t-lg sm:rounded-lg shadow-lg pb-safe focus:outline-none">
          <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/15" aria-hidden />
          <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:pt-5">
            <div>
              <Dialog.Title className="display text-[28px]">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-[15px] text-graphite">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="press shrink-0 grid place-items-center h-11 w-11 -mr-2 -mt-1 rounded-full hover:bg-ink/5" aria-label="Close"><X size={20} aria-hidden /></Dialog.Close>
          </div>
          <div className="px-5 pt-4 pb-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
