import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { calculateShiftAllowance } from "@/data/salary";

// Extend Day.js with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);



export const POST = async () => {
    try {
        const attend = await db.attends.findFirst({ where: { id: "cmbpinkou011sguapxg81092t" } })
        let result = await calculateShiftAllowance(attend?.clockIn, attend?.clockOut, true)
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Error in night shift analysis:", error);
        return Response.json(
            { error: "Internal server error", details: error },
            { status: 500 }
        );
    }
}