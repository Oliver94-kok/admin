import { create } from 'zustand';
import { AttendBranch, User } from '@prisma/client';
import { BranchsUser } from '@/types/branchs';


interface ListUser {
    A: BranchsUser[];
    B: BranchsUser[];
    C: BranchsUser[];
    D: BranchsUser[];
    E: BranchsUser[];
    SW: BranchsUser[];
}// Store interface
interface UserBranchStore {
    // State
    userData: ListUser | null;
    loading: boolean;
    error: string | null;
    selectedBranch: keyof ListUser | 'ALL';

    // Actions
    setUserData: (data: ListUser) => void;
    updateUserInBranch: (branch: keyof ListUser, userId: string, updates: Partial<BranchsUser>) => void;
    addUserToBranch: (branch: keyof ListUser, user: BranchsUser) => void;
    removeUserFromBranch: (branch: keyof ListUser, userId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSelectedBranch: (branch: keyof ListUser | 'ALL') => void;
    clearData: () => void;

    // Selectors
    getFilteredUsers: () => BranchsUser[];
    getAllUsers: () => BranchsUser[];
    getUsersByBranch: (branch: keyof ListUser) => BranchsUser[];
    getTotalUserCount: () => number;
    getBranchUserCount: (branch: keyof ListUser) => number;
}

// Initial state
const initialUserData: ListUser = {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    SW: []
};

export const useUserBranchStore = create<UserBranchStore>((set, get) => ({
    // Initial state
    userData: null,
    loading: false,
    error: null,
    selectedBranch: 'ALL',

    // Actions
    setUserData: (data) => set({ userData: data, error: null }),

    updateUserInBranch: (branch, userId, updates) => set((state) => {
        if (!state.userData) return state;

        return {
            userData: {
                ...state.userData,
                [branch]: state.userData[branch].map(branchUser =>
                    branchUser.userId === userId ? { ...branchUser, ...updates } : branchUser
                )
            }
        };
    }),

    addUserToBranch: (branch, user) => set((state) => {
        if (!state.userData) return { userData: { ...initialUserData, [branch]: [user] } };

        return {
            userData: {
                ...state.userData,
                [branch]: [...state.userData[branch], user]
            }
        };
    }),

    removeUserFromBranch: (branch, userId) => set((state) => {
        if (!state.userData) return state;

        return {
            userData: {
                ...state.userData,
                [branch]: state.userData[branch].filter(branchUser => branchUser.userId !== userId)
            }
        };
    }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    setSelectedBranch: (selectedBranch) => set({ selectedBranch }),

    clearData: () => set({
        userData: null,
        error: null,
        selectedBranch: 'ALL'
    }),

    // Selectors
    getFilteredUsers: () => {
        const { userData, selectedBranch } = get();
        console.log("🔍 Store Debug - userData:", userData);
        console.log("🔍 Store Debug - selectedBranch:", selectedBranch);

        if (!userData) return [];

        if (selectedBranch === 'ALL') {
            const allUsers = Object.values(userData).flat();
            console.log("🔍 Store Debug - ALL users count:", allUsers.length);
            return allUsers;
        }

        // Return users from the selected branch
        const branchUsers = userData[selectedBranch] || [];
        console.log(`🔍 Store Debug - Branch ${selectedBranch} users:`, branchUsers);
        console.log(`🔍 Store Debug - Branch ${selectedBranch} users count:`, branchUsers.length);
        return branchUsers;
    },

    getAllUsers: () => {
        const { userData } = get();
        if (!userData) return [];
        return Object.values(userData).flat();
    },

    getUsersByBranch: (branch) => {
        const { userData } = get();
        if (!userData) return [];
        return userData[branch] || [];
    },

    getTotalUserCount: () => {
        const { userData } = get();
        if (!userData) return 0;
        return Object.values(userData).reduce((total, branchUsers) => total + branchUsers.length, 0);
    },

    getBranchUserCount: (branch) => {
        const { userData } = get();
        if (!userData) return 0;
        return userData[branch]?.length || 0;
    }
}));