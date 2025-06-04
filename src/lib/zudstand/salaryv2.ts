// salary-store.ts
import { create } from 'zustand';
import { SalaryUser } from '@/types/salary';

interface SalaryStore {
    salaries: SalaryUser[];
    loading: boolean;
    error: string | null;
    selectedTeam: string;
    searchQuery: string;        // The actual search query used for filtering (debounced)
    localSearchQuery: string;   // The immediate input value (not debounced)
    searchDebounceTimer: NodeJS.Timeout | null;

    // Actions
    setSalaries: (salaries: SalaryUser[]) => void;
    updateSalary: (id: string, updates: Partial<SalaryUser>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSelectedTeam: (team: string) => void;
    setLocalSearchQuery: (query: string) => void; // This handles debouncing automatically
    clearSearch: () => void;

    // Selectors
    getFilteredSalaries: () => SalaryUser[];
    isSearching: () => boolean;
}

export const useSalaryStore = create<SalaryStore>((set, get) => ({
    salaries: [],
    loading: false,
    error: null,
    selectedTeam: 'A',
    searchQuery: '',
    localSearchQuery: '',
    searchDebounceTimer: null,

    setSalaries: (salaries) => set({ salaries }),

    updateSalary: (id, updates) => set((state) => ({
        salaries: state.salaries.map(salary =>
            salary.id === id ? { ...salary, ...updates } : salary
        )
    })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSelectedTeam: (selectedTeam) => set({ selectedTeam }),

    // The magic happens here - automatic debouncing
    setLocalSearchQuery: (localSearchQuery) => {
        const { searchDebounceTimer } = get();

        // Clear any existing timer
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        // Set up new timer to update searchQuery after delay
        const newTimer = setTimeout(() => {
            set({
                searchQuery: localSearchQuery,
                searchDebounceTimer: null
            });
        }, 300); // 300ms debounce delay

        // Immediately update local query and set new timer
        set({
            localSearchQuery,
            searchDebounceTimer: newTimer
        });
    },

    clearSearch: () => {
        const { searchDebounceTimer } = get();
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        set({
            searchQuery: '',
            localSearchQuery: '',
            searchDebounceTimer: null
        });
    },

    // Helper to check if search is in progress (debouncing)
    isSearching: () => {
        const { searchQuery, localSearchQuery } = get();
        return localSearchQuery !== searchQuery && localSearchQuery !== '';
    },

    // This uses the debounced searchQuery, not localSearchQuery
    getFilteredSalaries: () => {
        const { salaries, selectedTeam, searchQuery } = get();

        let filtered = salaries;

        // Filter by team first
        if (selectedTeam !== '' && selectedTeam !== 'ALL') {
            filtered = filtered.filter((s) => s.users?.AttendBranch?.team === selectedTeam);
        }

        // Then filter by search query (debounced)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((salary) => {
                // Search across multiple fields
                const searchFields = [
                    salary.users?.name,
                    salary.users?.username
                ].filter(Boolean); // Remove null/undefined values

                return searchFields.some(field =>
                    field?.toLowerCase().includes(query)
                );
            });
        }

        return filtered;
    }
}));