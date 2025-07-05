import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { calculateShiftAllowance } from "@/data/salary";
import { calculateOvertimeHours } from "@/data/attend";
import { TimeUtils } from "@/lib/timeUtility";

// Extend Day.js with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);



export const POST = async () => {
    try {
        const today = dayjs('2025-07-07');
        const shift = await db.attendBranch.findFirst({ where: { userId: "cm43y3p3t000zth7wl6ulhlml" } });
        if (!shift) {
            return Response.json({ "error": "error" }, { status: 400 })
        }
        let [hourOut, minuteOut] = shift.clockOut!.split(':').map(Number)
        let [hourIn, minuteIn] = shift.clockIn!.split(':').map(Number);
        let result = (hourOut - hourIn) / 2
        let result2 = Math.abs(result)
        let newtoday = today.set('hours', hourIn).set("minutes", minuteIn).add(result2, 'h')
        console.log("🚀 ~ POST ~ newtoday:", newtoday)
        let same = dayjs("2025-07-07 13:00", 'YYYY-MM-DD HH:mm');
        let isSame = same.isSame(newtoday);
        return Response.json({ result, result2, isSame, date: newtoday.format('YYYY-MM-DD HH:mm'), date2: same.format('YYYY-MM-DD HH:mm') }, { status: 200 });
    } catch (error) {
        console.error("Error in night shift analysis:", error);
        return Response.json(
            { error: "Internal server error", details: error },
            { status: 500 }
        );
    }
}