// salary-store.ts
import { create } from 'zustand';
import { SalaryUser } from '@/types/salary';

// Define sorting options
export type SortField = 'Username' | 'Branches' | 'BasicSalary' | 'TotalWorkingdays' | 'Fine' | 'Bonus' | 'Allow' | 'Advance' | 'Short' | 'OT' | 'Transport' | 'M' | 'TotalSalary';
export type SortOrder = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    order: SortOrder;
}

interface SalaryStore {
    salaries: SalaryUser[];
    loading: boolean;
    error: string | null;
    selectedTeam: string;
    searchQuery: string;        // The actual search query used for filtering (debounced)
    localSearchQuery: string;   // The immediate input value (not debounced)
    searchDebounceTimer: NodeJS.Timeout | null;

    // Sorting state
    sortConfig: SortConfig;

    // Actions
    setSalaries: (salaries: SalaryUser[]) => void;
    updateSalary: (id: string, updates: Partial<SalaryUser>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSelectedTeam: (team: string) => void;
    setLocalSearchQuery: (query: string) => void; // This handles debouncing automatically
    clearSearch: () => void;

    // Sorting actions
    setSortConfig: (config: SortConfig) => void;
    setSortField: (field: SortField) => void; // Smart toggle - reverses order if same field
    clearSort: () => void;

    // Selectors
    getFilteredSalaries: () => SalaryUser[];
    getSortedAndFilteredSalaries: () => SalaryUser[];
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

    // Default sorting by name ascending
    sortConfig: { field: 'Branches', order: 'asc' },

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

    // Sorting actions
    setSortConfig: (sortConfig) => set({ sortConfig }),

    setSortField: (field) => {
        const { sortConfig } = get();
        const newOrder = sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
        set({ sortConfig: { field, order: newOrder } });
    },

    clearSort: () => set({ sortConfig: { field: 'Username', order: 'asc' } }),

    // Helper to check if search is in progress (debouncing)
    isSearching: () => {
        const { searchQuery, localSearchQuery } = get();
        return localSearchQuery !== searchQuery && localSearchQuery !== '';
    },

    // Original filtering method (kept for compatibility)
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
    },

    // New method that includes both filtering AND sorting
    getSortedAndFilteredSalaries: () => {
        const { sortConfig } = get();
        const filtered = get().getFilteredSalaries();

        // Sort the filtered results
        const sorted = [...filtered].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            // Get values based on sort field
            switch (sortConfig.field) {
                case 'Username':
                    aValue = a.users?.name || '';
                    bValue = b.users?.name || '';
                    break;
                case 'Branches':
                    aValue = a.users?.AttendBranch?.branch || '';
                    bValue = b.users?.AttendBranch?.branch || '';
                    break;
                case 'BasicSalary':
                    aValue = a.perDay || 0;
                    bValue = a.perDay || 0;
                    break;
                case 'TotalWorkingdays':
                    aValue = a.workingDay || 0;
                    bValue = a.workingDay || 0;
                    break;
                // case 'Fine':
                //     aValue = a.f || '';
                //     bValue = b.users?.AttendBranch?.team || '';
                //     break;
                case 'Bonus':
                    aValue = a.bonus || 0;
                    bValue = b.bonus || 0;
                    break;
                case 'Allow':
                    aValue = a.allowance || 0;
                    bValue = b.allowance || 0;
                    break;
                case 'Advance':
                    aValue = a.advances || 0;
                    bValue = b.advances || 0;
                    break;
                case 'Short':
                    aValue = a.short || 0;
                    bValue = b.short || 0;
                    break;
                case 'OT':
                    aValue = a.overTime || 0;
                    bValue = b.overTime || 0;
                    break;
                case 'Transport':
                    aValue = a.transport || 0;
                    bValue = b.transport || 0;
                    break;
                case 'M':
                    aValue = a.m || 0;
                    bValue = b.m || 0;
                    break;
                case 'TotalSalary':
                    aValue = a.total || 0;
                    bValue = b.total || 0;
                    break;
                default:
                    aValue = '';
                    bValue = '';
            }

            let comparison = 0;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                // Proper numerical comparison - this handles negatives correctly
                // -142 < 0 < 142 when ascending
                comparison = aValue - bValue;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (aValue instanceof Date && bValue instanceof Date) {
                comparison = aValue.getTime() - bValue.getTime();
            } else {
                // Fallback to string comparison
                comparison = String(aValue).localeCompare(String(bValue));
            }

            // Apply sort order
            return sortConfig.order === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }
}));