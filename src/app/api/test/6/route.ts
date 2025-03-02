import { db } from "@/lib/db";

export const POST = async (req: Request) => {
  try {
    const { team, startDate, endDate } = await req.json();
    
    // Get all users in the specified team
    const users = await db.user.findMany({
      where: { role: "USER", AttendBranch: { team } },
      select: { 
        id: true,
        name: true,
      },
    });

    const BATCH_SIZE = 3;
    const results = [];
    
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        userBatch.map(async (user) => {
          try {
            // Get attendance records
            let attend = await db.attends.findMany({
              where: {
                dates: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
                userId: user.id,
              },
              select: {
                id: true,
                dates: true,
                // checkIn: true,
                // checkOut: true,
              },
              orderBy: {
                dates: 'asc',
              }
            });
            
            // Check for redundant dates and summarize them
            const dateMap = new Map();
            const redundantDates: any[] | undefined = [];
            
            attend.forEach(record => {
              const dateStr = record.dates.toISOString().split('T')[0];
              
              if (dateMap.has(dateStr)) {
                redundantDates.push({
                  date: dateStr,
                  records: [...dateMap.get(dateStr), record.id]
                });
                dateMap.set(dateStr, [...dateMap.get(dateStr), record.id]);
              } else {
                dateMap.set(dateStr, [record.id]);
              }
            });
            
            // Count unique dates (one per day)
            const uniqueDatesCount = dateMap.size;
            
            if (attend.length > 28) {
              return {
                userId: user.id,
                userName: user.name,
                totalRecords: attend.length,
                uniqueDatesCount,
                hasRedundantDates: redundantDates.length > 0,
                redundantDates: redundantDates.length > 0 ? redundantDates : undefined,
                success: true,
                more: true,
              };
            }
            
            return {
              userId: user.id,
              userName: user.name,
              totalRecords: attend.length,
              uniqueDatesCount,
              hasRedundantDates: redundantDates.length > 0,
              redundantDates: redundantDates.length > 0 ? redundantDates : undefined,
              success: true,
            };
          } catch (err) {
            const error = err as Error;
            console.error(`Error processing user ${user.id}:`, error);
            return {
              userId: user.id,
              error: error.message || "Unknown error occurred",
              success: false,
            };
          }
        })
      );
      
      results.push(...batchResults);

      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    
    // Properly handle fulfilled and rejected promises
    const processedResults = results.map(result => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return { 
          userId: "unknown", 
          error: result.reason?.toString() || "Unknown rejection reason", 
          success: false 
        };
      }
    });
    
    // Filter with proper type checking
    const highAttendanceUsers = processedResults
      .filter(r => r.success === true && r.more === true);
    
    const redundantDataUsers = processedResults
      .filter(r => r.success === true && r.hasRedundantDates === true);
    
    const summary = {
      totalProcessed: results.length,
      successful: processedResults.filter(r => r.success === true).length,
      failed: processedResults.filter(r => r.success === false).length,
      highAttendanceCount: highAttendanceUsers.length,
      usersWithRedundantDates: redundantDataUsers.length,
      highAttendanceUsers,
      redundantDataUsers,
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Failed to process attendance data" }, { status: 400 });
  }
};