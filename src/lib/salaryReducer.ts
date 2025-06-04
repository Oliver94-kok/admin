import { SalaryUser } from "@/types/salary";

export type SalaryState = {
    salaries: SalaryUser[];
    filteredSalaries: SalaryUser[];
    isLoading: boolean;
    error: string | null;
    selectedTeam: string;
};

export type SalaryAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: SalaryUser[] }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'ADD_SALARY'; payload: SalaryUser }
    | { type: 'UPDATE_SALARY'; payload: { id: string; updates: Partial<SalaryUser> } }
    | { type: 'DELETE_SALARY'; payload: { id: string } }
    | { type: 'FILTER_BY_TEAM'; payload: string };

export const initialSalaryState: SalaryState = {
    salaries: [],
    filteredSalaries: [],
    isLoading: false,
    error: null,
    selectedTeam: '',
};

export function salaryReducer(state: SalaryState, action: SalaryAction): SalaryState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                salaries: action.payload,
                filteredSalaries: filterSalariesByTeam(action.payload, state.selectedTeam)
            };

        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'FILTER_BY_TEAM':
            return {
                ...state,
                selectedTeam: action.payload,
                filteredSalaries: filterSalariesByTeam(state.salaries, action.payload)
            };

        case 'ADD_SALARY':
            const newSalaries = [...state.salaries, action.payload];
            return {
                ...state,
                salaries: newSalaries,
                filteredSalaries: filterSalariesByTeam(newSalaries, state.selectedTeam)
            };

        case 'UPDATE_SALARY':
            const updatedSalaries = state.salaries.map((salary) =>
                salary.id === action.payload.id
                    ? { ...salary, ...action.payload.updates }
                    : salary
            );
            return {
                ...state,
                salaries: updatedSalaries,
                filteredSalaries: filterSalariesByTeam(updatedSalaries, state.selectedTeam)
            };

        case 'DELETE_SALARY':
            const remainingSalaries = state.salaries.filter(
                (salary) => salary.id !== action.payload.id
            );
            return {
                ...state,
                salaries: remainingSalaries,
                filteredSalaries: filterSalariesByTeam(remainingSalaries, state.selectedTeam)
            };

        default:
            console.warn('Unhandled action in salaryReducer:', action);
            throw new Error(`Unhandled action type in salaryReducer`);
    }
}

// Helper function to filter salaries by team
function filterSalariesByTeam(salaries: SalaryUser[], team: string): SalaryUser[] {
    if (!team || team === '' || team === 'ALL') {
        return salaries;
    }
    return salaries.filter((salary) => salary.users?.AttendBranch?.team === team);
}