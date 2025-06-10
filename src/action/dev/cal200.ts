// try {
//     const users = await db.attendBranch.findMany({
//         where: {
//             branch: { in: branchAssistant }
//         },
//         include: {
//             users: true
//         }
//     });

//     const BATCH_SIZE = 3;
//     const results = [];

//     for (let i = 0; i < users.length; i += BATCH_SIZE) {
//         const userBatch = users.slice(i, i + BATCH_SIZE);

//         const batchResults = await Promise.allSettled(
//             userBatch.map(async (user) => {
//                 try {
//                     const attend = await db.attends.findMany({
//                         where: {
//                             userId: user.userId,
//                             status: { not: "Active" },
//                             dates: {
//                                 gte: new Date("2025-06-01"),
//                                 lte: new Date("2025-06-30")
//                             }
//                         }
//                     });

//                     // Fixed: await the map operations
//                     await Promise.all(
//                         attend.map(async (a) => {
//                             if (a.status === "Late") {
//                                 await db.attends.update({
//                                     where: { id: a.id },
//                                     data: { fine: 200 }
//                                 });
//                             } else if (a.status === "No_ClockIn_ClockOut") {
//                                 await db.attends.update({
//                                     where: { id: a.id },
//                                     data: { fine2: 200 }
//                                 });
//                             } else if (a.status === "No_clockIn_ClockOut_Late") {
//                                 await db.attends.update({
//                                     where: { id: a.id },
//                                     data: { fine: 200, fine2: 200 }
//                                 });
//                             }
//                         })
//                     );

//                     return {
//                         userId: user.users?.name,
//                         attend,
//                         success: true,
//                     };
//                 } catch (err) {
//                     const error = err as Error;
//                     console.error(`Error processing user ${user.id}:`, error);
//                     return {
//                         userId: user.id,
//                         error: error.message || "Unknown error occurred",
//                         success: false,
//                     };
//                 }
//             }),
//         );

//         results.push(...batchResults);

//         // Add delay between batches (except for the last batch)
//         if (i + BATCH_SIZE < users.length) {
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//         }
//     }

//     const summary = {
//         totalProcessed: results.length,
//         successful: results.filter(
//             (r) => r.status === "fulfilled" && r.value?.success,
//         ).length,
//         failed: results.filter((r) =>
//             r.status === "rejected" || (r.status === "fulfilled" && !r.value?.success)
//         ).length,
//         // Include successful results in details
//         details: results
//             .filter((r) => r.status === "fulfilled" && r.value?.success)
//             .map((r) => r.value), // Extract the actual value
//     };

//     return new Response(JSON.stringify(summary), {
//         status: 200,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
// } catch (error) {
//     console.error('Error in POST:', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//         status: 500,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
// }