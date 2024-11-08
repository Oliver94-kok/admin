import { create } from "zustand";

interface IdState {
  ids: string[];
  // Setters
  addIds: (newIds: string[]) => void;
  addId: (id: string) => void;
  removeId: (id: string) => void;
  clearIds: () => void;
  // Getters
  getAllIds: () => string[];
  getIdCount: () => number;
  hasId: (id: string) => boolean;
  // Storage
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useIdStore = create<IdState>((set, get) => ({
  ids: [],

  // Setters
  addIds: (newIds) => {
    const uniqueIds = newIds.filter((id) => !get().ids.includes(id));
    set((state) => ({ ids: [...state.ids, ...uniqueIds] }));
  },

  addId: (id) => {
    if (!get().ids.includes(id)) {
      set((state) => ({ ids: [...state.ids, id] }));
    } else {
      console.log(`ID ${id} already exists.`);
    }
  },

  removeId: (id) =>
    set((state) => ({
      ids: state.ids.filter((existingId) => existingId !== id),
    })),

  clearIds: () => set({ ids: [] }),

  // Getters
  getAllIds: () => get().ids,

  getIdCount: () => get().ids.length,

  hasId: (id) => get().ids.includes(id),

  // Storage
  loadFromStorage: () => {
    const storedData = localStorage.getItem("myAppIds");
    if (storedData) {
      set({ ids: JSON.parse(storedData) });
    }
  },

  saveToStorage: () => {
    localStorage.setItem("myAppIds", JSON.stringify(get().ids));
  },
}));
