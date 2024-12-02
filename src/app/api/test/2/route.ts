// import { calOverTime2, cronAttend } from "@/data/attend";
// import { db } from "@/lib/db";
// import { DateTime } from "luxon";
// import { TimeUtils } from "@/lib/timeUtility";
// import { AttendStatus } from "@prisma/client";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";

import { db } from "@/lib/db"
import dayjs from "dayjs";

// export const dynamic = "force-dynamic";
export const GET = async (request: Request) => {
  const today = dayjs();
  const now = new Date(today.format("YYYY-MM-DD"));
  let user = await db.attends.findMany({where:{dates:now}})
  return Response.json({user},{status:200})
}
// export const GET = async (request: Request) => {
//     const today = dayjs();
//     const now = new Date(today.format("YYYY-MM-DD"));
//     let user = await db.attends.findFirst({where:{userId:"cm446pbz6006majoq7i3t9n1x",dates:now}})
//     let resutl;
//    if(user){
//     let users = await db.attendBranch.findFirst({ where: { userId:user.userId } });

//     let c = dayjs(user.clockOut);
//     // var start = DateTime.fromISO(c.toISOString());
//      var start = DateTime.fromISO( user!.clockOut!.toISOString());
//      var nowstart = new Date(start.toString())
//      const shiftOut = TimeUtils.createDateFromTimeString(
//         now,
//         users!.clockOut!,
//         "out",
//       );
//     console.log("🚀 ~ calOverTime ~ start:", shiftOut);

//     // var end = DateTime.fromISO(shiftOut!.toISOString()).set({
//     //   year: start.year,
//     //   month: start.month,
//     //   day: ,
//     // });

//     console.log("🚀 ~ calOverTime ~ end:", end);

//     var hour = start.diff(end, ["hours", "minutes", "seconds"]);
//     console.log("hour sd ", hour);
//     var min = hour.minutes;
//     var checkNegative = hour.as("minute").toFixed();
//     if (Number(checkNegative) < 0) {
//       return   Response.json({ "resutl" :0},{status:200})
//     }
//     return Response.json({ "resutl":hour.as("minute").toFixed()},{status:200}) 
    
//    }
//     return Response.json({user, resutl},{status:200})
// }



// export const POST = async (req: Request) => {
//     const {data} =await req.json()
//     const today = dayjs();
  
//     // Fetch users
//     // let users = await db.user.findMany({where:{role:"USER"}});
//     // const userIds: string[] = users.map(user => user.id);
// //add the userid in the array
//     const userIds: string[] = data
//     console.log("userid",userIds)
//     // Process users with error handling
//     const processResults = await Promise.allSettled(
//       userIds.map(async (u) => {
//         try {
//           // Find shift for the user
//           let shift = await db.attendBranch.findFirst({where:{userId:u}});
          
//           // Create date
//           const now = new Date(today.format("YYYY-MM-DD"));
          
//           // Validate shift exists
//           if (!shift?.clockIn) {
//             throw new Error(`No shift found for user ${u}`);
//           }
          
//           // Create shift in time
//           const shiftIn = TimeUtils.createDateFromTimeString(
//             now,
//             shift.clockIn,
//             "in"
//           );
          
          
//           console.log("shiftIn ", shiftIn);
          
//           // Check if attendance exists
//           let attend = await db.attends.findFirst({where:{userId:u, dates:now}});
          
//           // If no attendance, create it
//           if (!attend) {
//             console.log("masuk sini");
//             let data = {
//               userId: u,
//               dates: now,
//               clockIn: shiftIn,
//               status:AttendStatus.Active
  
//             };
            
//             // Uncomment to actually create the record
//             await db.attends.create({data})
            
//             return {
//               userId: u,
//               status: 'created',
//               data: data
//             };
//           }
          
//           return {
//             userId: u,
//             status: 'already_exists'
//           };
//         } catch (error) {
//           console.error(`Error processing user ${u}:`, error);
//           return {
//             userId: u,
//             status: 'error',
//             error: error instanceof Error ? error.message : String(error)
//           };
//         }
//       })
//     );
    
//     // Prepare results summary
//     const results = {
//       successful: processResults.filter(
//         (result) => result.status === "fulfilled" && 
//                    result.value.status === 'created'
//       ),
//       skipped: processResults.filter(
//         (result) => result.status === "fulfilled" && 
//                    result.value.status === 'skipped'
//       ),
//       failed: processResults.filter(
//         (result) => result.status === "rejected" || 
//                    (result.status === "fulfilled" && result.value.status === 'error')
//       ),
//       timestamp: new Date(),
//       totalProcessed: processResults.length
//     };
    
//     return Response.json({ results }, { status: 200 });
//   };