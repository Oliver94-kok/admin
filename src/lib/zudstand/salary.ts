import { SalaryUser } from "@/types/salary";
import { create } from "zustand";

interface SalaryState {
  salaryUsers: SalaryUser[];
  addSalaryUsers: (users: SalaryUser[]) => void;
  addSalaryUser: (user: SalaryUser) => void;
  editSalaryUser: (id: string, updatedFields: Partial<SalaryUser>) => void;
  filterAndRemoveSalaryUsers: (filterParams: Partial<SalaryUser>) => void;
  clearSalaryUsers: () => void;
  loadSalaryUsersFromStorage: () => void;
  saveSalaryUsersToStorage: () => void;
}

export const useSalaryStore = create<SalaryState>((set, get) => ({
  salaryUsers: [],
  addSalaryUsers: (users) => {
    const uniqueUsers = users.filter(
      (user) =>
        !get().salaryUsers.some((existingUser) => existingUser.id === user.id),
    );
    set((state) => ({ salaryUsers: [...state.salaryUsers, ...uniqueUsers] }));
  },
  addSalaryUser: (user) => {
    if (
      !get().salaryUsers.some((existingUser) => existingUser.id === user.id)
    ) {
      set((state) => ({ salaryUsers: [...state.salaryUsers, user] }));
    } else {
      console.log(`Salary user with id ${user.id} already exists.`);
    }
  },
  editSalaryUser: (id, updatedFields) =>
    set((state) => ({
      salaryUsers: state.salaryUsers.map((user) =>
        user.id === id ? { ...user, ...updatedFields } : user,
      ),
    })),
  filterAndRemoveSalaryUsers: (filterParams) =>
    set((state) => ({
      salaryUsers: state.salaryUsers.filter(
        (user) =>
          !Object.entries(filterParams).every(
            ([key, value]) => user[key as keyof SalaryUser] === value,
          ),
      ),
    })),
  clearSalaryUsers: () =>
    set((state) => ({
      salaryUsers: [],
    })),
  loadSalaryUsersFromStorage: async () => {
    const storedData = localStorage.getItem("myAppData");
    if (storedData) {
      set({ salaryUsers: JSON.parse(storedData) });
    }
  },
  saveSalaryUsersToStorage: async () => {
    localStorage.setItem("myAppData", JSON.stringify(get().salaryUsers));
  },
}));
