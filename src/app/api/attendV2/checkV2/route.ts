import { isOffDay } from "@/data/attend";
import { db } from "@/lib/db";
import dayjs from "dayjs";


export const POST = async (req: Request) => {
    try {
        const { userId } = await req.json();
        if (!userId) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }
        const todayDayjs = dayjs().format("YYYY-MM-DD");
        const today = new Date(todayDayjs);
        const activeAttendant = await db.attends.findFirst({ where: { status: "Active", userId } });
        const todayAttendant = await db.attends.findFirst({ where: { userId, dates: today } })
        if (activeAttendant) {
            let yesterday = dayjs().subtract(1, 'day');
            let dateActive = dayjs(activeAttendant.dates);
            if (dateActive.isSame(yesterday, 'day')) {
                return Response.json({
                    id: activeAttendant.id,
                    status: activeAttendant.status,
                    shiftIn: activeAttendant.clockIn,
                    shiftOut: activeAttendant.clockOut,
                    locationIn: activeAttendant.locationIn,
                    locationOut: activeAttendant.locationOut,
                }, { status: 200 });
            }
        }
        if (todayAttendant) {
            return Response.json({
                id: todayAttendant.id,
                status: todayAttendant.status,
                shiftIn: todayAttendant.clockIn,
                shiftOut: todayAttendant.clockOut,
                locationIn: todayAttendant.locationIn,
                locationOut: todayAttendant.locationOut,
            }, { status: 200 });
        }
        let shift = await db.attendBranch.findFirst({ where: { userId } });
        if (!shift) throw new Error("No shift time");

        if (shift.offDay) {
            let offdays = shift.offDay.split(",");
            let resultOffDay = await isOffDay(offdays, "TODAY");
            if (resultOffDay) {
                await db.attends.create({ data: { userId, status: "OffDay", dates: today } });
                return Response.json({ status: "OffDay" }, { status: 200 });
            }
        }

        // If no attendance record is found and it's not an off day
        return Response.json({ status: "Not_Start_shift" }, { status: 200 });


    } catch (error) {
        return Response.json(error, { status: 400 })
    }
}