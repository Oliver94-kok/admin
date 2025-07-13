import { db } from "@/lib/db";
import { branchAssistant } from "@/types/branchs";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { calculateShiftAllowance, getNoClockOut } from "@/data/salary";
import { calculateOvertimeHours } from "@/data/attend";
import { TimeUtils } from "@/lib/timeUtility";

// Extend Day.js with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);


export const GET = async () => {
    try {
        const today = dayjs('2025-07-12');
        const attend = await db.attends.findMany({ where: { dates: new Date('2025-07-12'), status: "Active" }, });
        const result = Promise.all(
            attend.map(async (a) => {
                const shift = await db.attendBranch.findFirst({ where: { userId: a.userId } })
                if (!shift) {
                    return;
                }
                let [hourOut, minuteOut] = shift.clockOut!.split(':').map(Number);
                let timeOut;
                if (hourOut > 0 && hourOut <= 7) {
                    timeOut = today.set('hours', hourOut).set("minutes", minuteOut).add(1, 'day'); // Convert to 24-hour format if needed
                } else {
                    timeOut = today.set('hours', hourOut).set("minutes", minuteOut);
                }
                if (dayjs().isAfter(timeOut)) {
                    let fine200 = branchAssistant.find((e) => e === shift?.branch)
                    let fine2;
                    if (fine200) {
                        fine2 = 200;
                    } else {
                        fine2 = await getNoClockOut(
                            a.userId,
                            new Date().getMonth() + 1,
                            new Date().getFullYear()
                        );
                    }
                    await db.attends.update({
                        where: { id: a.id }, data: {
                            status: "No_ClockIn_ClockOut",
                            fine2
                        }
                    })
                }

            })
        )
        return Response.json(attend, { status: 200 })
    } catch (error) {
        console.error("Error in night shift analysis:", error);
        return Response.json(
            { error: "Internal server error", details: error },
            { status: 500 }
        );
    }
}


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