import { cronAttend } from "@/data/attend";
import { db } from "@/lib/db";
import { DateTime } from "luxon";
import { TimeUtils } from "@/lib/timeUtility";
import { AttendStatus } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
export const dynamic = "force-dynamic";
export const GET = async () => {
  const today = dayjs();

  // Fetch users
  let users = await db.user.findMany({where:{role:"USER"}});
  const userIds: string[] = users.map(user => user.id);
  
  // Process users with error handling
  const processResults = await Promise.allSettled(
    userIds.map(async (u) => {
      try {
        // Find shift for the user
        let shift = await db.attendBranch.findFirst({where:{userId:u}});
        
        // Create date
        const now = new Date(today.format("YYYY-MM-DD"));
        
        // Validate shift exists
        if (!shift?.clockIn) {
          throw new Error(`No shift found for user ${u}`);
        }
        
        // Create shift in time
        const shiftIn = TimeUtils.createDateFromTimeString(
          now,
          shift.clockIn,
          "in"
        );
        
        // Check if shift is before 11 AM
        const shiftTime = dayjs(shiftIn);
        const elevenAM = dayjs(now).hour(11).minute(0).second(0);
        
        // Only proceed if shift is before 11 AM
        if (shiftTime.isAfter(elevenAM)) {
          console.log(`Skipping user ${u}: Shift after 11 AM`);
          return {
            userId: u,
            status: 'skipped',
            reason: 'Shift after 11 AM'
          };
        }
        
        console.log("shiftIn ", shiftIn);
        
        // Check if attendance exists
        let attend = await db.attends.findFirst({where:{userId:u, dates:now}});
        
        // If no attendance, create it
        if (!attend) {
          console.log("masuk sini");
          let data = {
            clockOut: shiftIn,
            status:AttendStatus.Full_Attend

          };
          
          // Uncomment to actually create the record
          await db.attends.update({where:{id:u},data})
          
          return {
            userId: u,
            status: 'created',
            data: data
          };
        }
        
        return {
          userId: u,
          status: 'already_exists'
        };
      } catch (error) {
        console.error(`Error processing user ${u}:`, error);
        return {
          userId: u,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    })
  );
  
  // Prepare results summary
  const results = {
    successful: processResults.filter(
      (result) => result.status === "fulfilled" && 
                 result.value.status === 'created'
    ),
    skipped: processResults.filter(
      (result) => result.status === "fulfilled" && 
                 result.value.status === 'skipped'
    ),
    failed: processResults.filter(
      (result) => result.status === "rejected" || 
                 (result.status === "fulfilled" && result.value.status === 'error')
    ),
    timestamp: new Date(),
    totalProcessed: processResults.length
  };
  
  return Response.json({ results }, { status: 200 });
};


export const POST = async (req: Request) => {
  const today = dayjs();
  const now = new Date(today.format("YYYY-MM-DD"));

  let attend = await db.attends.findMany({where:{dates:now,status:"Active"}});
  const processResults = await Promise.allSettled(
    attend.map(async(a)=>{
      try {
        // Find shift for the user
       let shift = await db.attendBranch.findFirst({where:{userId:a.userId}});
       if (!shift?.clockIn || !shift?.clockOut) {
        throw new Error(`No shift found for user ${a.userId}`);
      }
       const shiftIn = TimeUtils.createDateFromTimeString(
        now,
        shift.clockIn,
        "in",
      );
      const shiftOut = TimeUtils.createDateFromTimeString(
        now,
        shift.clockOut,
        "out",
      );
      const shiftTime = dayjs(shiftIn);
      const elevenAM = dayjs(now).hour(12).minute(0).second(0);
      
      // Only proceed if shift is before 11 AM
      if (shiftTime.isAfter(elevenAM)) {
        console.log(`Skipping user ${a.userId}: Shift after 11 AM`);
        return {
          userId: a,
          status: 'skipped',
          reason: 'Shift after 11 AM'
        };
      }
      let data ={
        clockOut:shiftOut,
        status:AttendStatus.Full_Attend
      }
      await db.attends.update({where:{id:a.id},data})
          return {
            userId: a,
            status: 'created',
            data: data
          };
        
      } catch (error) {
        console.error(`Error processing user ${a.id}:`, error);
        return {
          userId: a.userId,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    })
  )
  const results = {
    successful: processResults.filter(
      (result) => result.status === "fulfilled" && 
                 result.value.status === 'created'
    ),
    skipped: processResults.filter(
      (result) => result.status === "fulfilled" && 
                 result.value.status === 'skipped'
    ),
    failed: processResults.filter(
      (result) => result.status === "rejected" || 
                 (result.status === "fulfilled" && result.value.status === 'error')
    ),
    timestamp: new Date(),
    totalProcessed: processResults.length
  };
  
  return Response.json({ results }, { status: 200 });
}

