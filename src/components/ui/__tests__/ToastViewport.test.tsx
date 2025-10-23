import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import ToastViewport from '@/components/ui/ToastViewport';
import { ToastVariant, useUiStore } from '@/store/uiStore';

describe('ToastViewport', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  const cleanup = () => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container?.isConnected) {
      container.remove();
    }
    useUiStore.getState().clearToasts();
    vi.useRealTimers();
    vi.restoreAllMocks();
    root = null;
    container = null;
  };

  afterEach(() => {
    cleanup();
  });

  it('dismisses existing toasts after their original lifetime even when new ones appear', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(<ToastViewport />);
    });

    act(() => {
      useUiStore.getState().pushToast({
        title: 'Alpha',
        description: undefined,
        variant: ToastVariant.Info,
      });
    });

    const firstToastId = useUiStore.getState().toasts[0]?.id;
    expect(firstToastId).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(3500);
    });
    vi.setSystemTime(3500);

    act(() => {
      useUiStore.getState().pushToast({
        title: 'Beta',
        description: undefined,
        variant: ToastVariant.Warning,
      });
    });

    expect(useUiStore.getState().toasts.map((toast) => toast.id)).toContain(firstToastId!);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    vi.setSystemTime(4100);

    const remainingIds = useUiStore.getState().toasts.map((toast) => toast.id);
    expect(remainingIds).not.toContain(firstToastId!);
    expect(remainingIds.length).toBe(1);
  });
});
