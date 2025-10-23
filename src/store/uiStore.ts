import { create } from 'zustand';

export enum ToastVariant {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  createdAt: number;
}

interface UiState {
  toasts: ToastMessage[];
}

interface UiActions {
  pushToast: (toast: Omit<ToastMessage, 'id' | 'createdAt'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Global UI state store that keeps ephemeral interface feedback such as toast messages.
 * It enables non-component modules (stores, actions) to surface notifications to the player.
 */
export const useUiStore = create<UiState & UiActions>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
        },
      ],
    }));
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => set({ toasts: [] }),
}));
