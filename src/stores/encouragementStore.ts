import { create } from 'zustand';
import { successNotificationHaptic } from '@/utils/haptics';

export type EncouragementTarget = 'nutrition' | 'progress';

export interface EncouragementMessage {
  id: number;
  target: EncouragementTarget;
  title: string;
  body?: string;
}

interface EncouragementState {
  message: EncouragementMessage | null;
  pushMessage: (target: EncouragementTarget, title: string, body?: string) => void;
  clearMessage: (id?: number) => void;
}

export const useEncouragementStore = create<EncouragementState>((set, get) => ({
  message: null,
  pushMessage: (target, title, body) => {
    successNotificationHaptic();
    set({
      message: {
        id: Date.now(),
        target,
        title,
        body,
      },
    });
  },
  clearMessage: (id) => {
    const current = get().message;
    if (!current || (id !== undefined && current.id !== id)) {
      return;
    }
    set({ message: null });
  },
}));
