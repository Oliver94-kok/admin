import { checkClockIn, handleClockIn, processClockOut } from "@/data/attend";
import { Logging } from "@/data/log";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db"
import { AttendStatus } from "@prisma/client";
import { z } from "zod";


export const POST = async (req: Request) => {
    try {
        const { userId, img, location, notice } = await req.json()
        if (!userId || !img || !location) {
            return Response.json({ Error: "Missing required fields" }, { status: 400 })
        }
        const [user, alreadyClockIn] = await Promise.all([
            getUserById(userId),
            checkClockIn(userId)
        ]);
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }
        if (alreadyClockIn) {
            return Response.json({ error: "User already clocked in" }, { status: 400 });
        }
        return handleClockIn(userId, img, location, notice, user.username)
    } catch (error) {
        return Response.json({ Error: "Something went wrong" }, { status: 500 })
    }
}
const notificationSchema = z.object({
    id: z.string().uuid(),
    date: z.string().regex(/^\d{2}\/\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    type: z.string(),
    shiftTime: z.string().regex(/^\d{2}:\d{2}$/),
    smallDate: z.string().regex(/^\d{2}\/\d{2} \d{2}:\d{2}$/),
    clockInLocation: z.string(),
});
const clockOutRequestSchema = z.object({
    userId: z.string().nonempty(),
    location: z.string().optional(),
    notify: notificationSchema.optional()
});

export const PATCH = async (req: Request): Promise<Response> => {
    let userId: string | undefined;;
    try {
        const body = await req.json();
        const validatedData = clockOutRequestSchema.safeParse(body);
        if (!validatedData.success) {
            return Response.json({
                error: "Invalid request data",
                details: validatedData.error.format()
            }, { status: 400 });
        }
        const { userId: validatedUserId, location, notify } = validatedData.data;
        userId = validatedUserId;

        const attendance = await checkClockIn(userId);
        // if (!attendance) {
        //   throw new Error("No clock-in record found");
        // }

        if (attendance?.status === AttendStatus.Full_Attend) {
            throw new Error("You have already clocked out");
        }
        return await processClockOut(userId, attendance!, location, notify);
    } catch (error) {
        console.log("🚀 ~ PATCH ~ error:", error)

        let err = error instanceof Error ? error.message : "An unknown error occurred"
        await Logging(userId!, "Patch clock", err)
        return Response.json({
            Error: error instanceof Error ? error.message : "An unknown error occurred"
        }, { status: 400 })
    }
};