"use server"

import { db } from "@/lib/db";
import { leaveType } from "@/types/leave";
import dayjs from "dayjs";

export interface SalaryPerUserProps {
    userId: string;
    month: number;
    year: number;
}

interface AttendanceRecord {
    id: string;
    status: string;
    leaves?: { type: string } | null;
}

interface SalaryCalculationResult {
    success: boolean;
    data?: {
        totalSalary: number;
        workingDays: number;
        fines: {
            noClockIn: number;
            late: number;
        };
        absences: number;
    };
    error?: string;
}

export const SalaryPerUser = async ({
    userId,
    year,
    month
}: SalaryPerUserProps): Promise<SalaryCalculationResult> => {
    try {
        // Input validation
        if (!userId || !year || !month) {
            return { success: false, error: "Missing required parameters" };
        }

        if (month < 1 || month > 12) {
            return { success: false, error: "Invalid month" };
        }

        // Date range calculation
        const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
        const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

        // Fetch salary record first to validate it exists
        const salary = await db.salary.findFirst({
            where: {
                userId,
                month: Number(month),
                year: Number(year)
            },
        });

        if (!salary) {
            return {
                success: false,
                error: `No salary record found for user ${userId} for ${month}/${year}`
            };
        }

        if (!salary.perDay) {
            return {
                success: false,
                error: "Per day salary not set for this user"
            };
        }

        // Single query to get all attendance data
        const attendanceData = await db.attends.findMany({
            where: {
                dates: {
                    gte: startDate,
                    lte: endDate,
                },
                userId,
            },
            select: {
                id: true,
                status: true,
                leaves: {
                    select: {
                        type: true
                    }
                }
            },
        });

        // Process attendance data
        const categorizedAttendance = categorizeAttendance(attendanceData);

        // Update fines in database using transaction for better performance
        const [updatedNoClockIn, updatedLate] = await Promise.all([
            updateAttendsInDb(categorizedAttendance.noClockIn, 'noclockinout'),
            updateAttendsInDb(categorizedAttendance.late, 'late'),
        ]);

        // Calculate fines
        const totalNoClockInFine = calculateFine(updatedNoClockIn.length);
        const totalLateFine = calculateFine(updatedLate.length);

        // Calculate working days
        const halfDayCount = categorizedAttendance.halfDay.length * 0.5;
        const totalWorkingDays = categorizedAttendance.present.length +
            categorizedAttendance.validLeave.length +
            halfDayCount;

        // Calculate total salary
        const baseSalary = totalWorkingDays * salary.perDay;
        const additionalPayments = (salary.advances || 0) +
            (salary.bonus || 0) +
            (salary.allowance || 0) +
            (salary.cover || 0) +
            (salary.m || 0) +
            (salary.overTime || 0) +
            (salary.transport || 0) +
            (salary.short || 0);

        const totalSalary = baseSalary - totalLateFine - totalNoClockInFine + additionalPayments;

        // Update salary record
        const updatedSalary = await db.salary.update({
            where: { id: salary.id },
            data: {
                total: totalSalary,
                fineNoClockIn: totalNoClockInFine,
                fineLate: totalLateFine,
                workingDay: totalWorkingDays,
                absent: categorizedAttendance.absent.length,
            },
        });

        return {
            success: true,
            data: {
                totalSalary,
                workingDays: totalWorkingDays,
                fines: {
                    noClockIn: totalNoClockInFine,
                    late: totalLateFine,
                },
                absences: categorizedAttendance.absent.length,
            }
        };

    } catch (error) {
        console.error('Error in SalaryPerUser:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
};

// Helper function to categorize attendance records
const categorizeAttendance = (attendanceData: AttendanceRecord[]) => {
    const categories = {
        noClockIn: [] as AttendanceRecord[],
        late: [] as AttendanceRecord[],
        present: [] as AttendanceRecord[],
        absent: [] as AttendanceRecord[],
        halfDay: [] as AttendanceRecord[],
        validLeave: [] as AttendanceRecord[],
    };

    for (const record of attendanceData) {
        switch (record.status) {
            case "No_ClockIn_ClockOut":
            case "No_clockIn_ClockOut_Late":
                categories.noClockIn.push(record);
                break;
            case "Late":
                categories.late.push(record);
                break;
                // case "Absent":
                //     categories.absent.push(record);
                break;
            case "Half_Day":
                categories.halfDay.push(record);
                break;
            case "Leave":
                // Only count as valid leave if it matches leave types
                if (record.leaves && leaveType.includes(record.leaves.type)) {
                    categories.validLeave.push(record);
                }
                break;
            default:
                // Count other statuses as present (excluding "Active")
                if (record.status !== "Active") {
                    categories.present.push(record);
                }
                break;
        }

        // Handle overlapping categories for late attendance
        if (["No_clockIn_ClockOut_Late"].includes(record.status)) {
            categories.late.push(record);
        }
    }

    return categories;
};

// Helper function to calculate progressive fines
const calculateFine = (count: number): number => {
    if (count === 0) return 0;

    // First offense: 50, subsequent offenses: 100 each
    return 50 + (count - 1) * 100;
};

// Improved updateAttendsInDb function with better error handling
const updateAttendsInDb = async (
    attendArray: AttendanceRecord[],
    fineType: "late" | "noclockinout"
): Promise<AttendanceRecord[]> => {
    if (attendArray.length === 0) {
        return [];
    }

    try {
        const updates = attendArray.map((attend, index) => {
            const fineAmount = index === 0 ? 50 : 100;
            const data = fineType === "late"
                ? { fine: fineAmount }
                : { fine2: fineAmount };

            return db.attends.update({
                where: { id: attend.id },
                data,
            });
        });

        await db.$transaction(updates);
        return attendArray;

    } catch (error) {
        console.error(`Error updating ${fineType} fines:`, error);
        throw new Error(`Failed to update ${fineType} fines`);
    }
};

// Alternative bulk update version for better performance with large datasets
const updateAttendsInDbBulk = async (
    attendArray: AttendanceRecord[],
    fineType: "late" | "noclockinout"
): Promise<AttendanceRecord[]> => {
    if (attendArray.length === 0) {
        return [];
    }

    try {
        const fineField = fineType === "late" ? "fine" : "fine2";
        const attendIds = attendArray.map(a => a.id);

        // Bulk update using raw SQL for better performance
        await db.$executeRaw`
            UPDATE attends 
            SET ${fineField} = CASE 
                WHEN id = ${attendIds[0]} THEN 50
                ELSE 100
            END
            WHERE id IN (${attendIds.join(',')})
        `;

        return attendArray;

    } catch (error) {
        console.error(`Error bulk updating ${fineType} fines:`, error);
        throw new Error(`Failed to bulk update ${fineType} fines`);
    }
};