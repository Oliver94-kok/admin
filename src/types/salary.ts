

export interface SalaryUser{
    id: string; 
    month: number; 
    year: number; 
    workingDay: number; 
    late: number | null; 
    overTimeHour: number | null; 
    overTime: number | null; 
    total      : number | null; 
    perDay: number | null
    users: { name: string; username: string; userImg: string | null; } | null;
}

