import { create } from 'zustand';

interface UiOverlayState {
  addMealSheetVisible: boolean;
  setAddMealSheetVisible: (visible: boolean) => void;
}

export const useUiOverlayStore = create<UiOverlayState>((set) => ({
  addMealSheetVisible: false,
  setAddMealSheetVisible: (visible) => set({ addMealSheetVisible: visible }),
}));
