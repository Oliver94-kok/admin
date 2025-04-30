import { getDataUser } from "@/action/getUserData";
import { calculateOvertimeHours } from "@/data/attend";
import { getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";
import { NextResponse } from "next/server";
interface User { id: string; /* other fields */ }
interface Salary { id: string; userId: string; month: number; perDay: number | null; /* other fields */ }
interface UserUpdateInfo { userId: string; newPerDay: number; }
interface ProcessResult { userId: string; status: 'updated' | 'condition_not_met' | 'no_month3_perDay' | 'error'; message?: string; }

export const GET = async (request: Request) => {
  const BATCH_SIZE_UPDATES = 10; // Batch size specifically for update operations
  const DELAY_BETWEEN_UPDATE_BATCHES = 500; // Delay for updates
  const processingResults: ProcessResult[] = [];
  let usersToUpdate: UserUpdateInfo[] = [];

  try {
    // 1. Fetch Users
    const users = await db.user.findMany({
      where: { role: 'USER', isDelete: false },
      select: { id: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ message: 'No users found matching criteria.', /* ... other summary fields ... */ }, { status: 200 });
    }
    const userIds = users.map(u => u.id);

    // 2. Fetch Salary Data Bulk (Months 3 to 11)
    const relevantSalaries = await db.salary.findMany({
      where: {
        userId: { in: userIds },
        month: { gte: 3, lte: 12 }, // Months 3 through 11
        year: 2025
      },
      select: { id: true, userId: true, month: true, perDay: true }, // Select only needed fields
    });

    // 3. Process In Memory - Group data and identify updates needed
    const salariesByUser = new Map<string, Salary[]>();
    for (const salary of relevantSalaries) {
      if (!salariesByUser.has(salary.userId)) {
        salariesByUser.set(salary.userId, []);
      }
      salariesByUser.get(salary.userId)!.push(salary);
    }

    for (const user of users) {
      const userSalaries = salariesByUser.get(user.id) || [];
      const salary4 = userSalaries.find(s => s.month === 4);
      const salary3 = userSalaries.find(s => s.month === 3);

      if (salary4 && salary4.perDay === null) {
        if (salary3 && salary3.perDay !== null) {
          // Condition met, Month 3 perDay exists - Mark for update
          usersToUpdate.push({ userId: user.id, newPerDay: salary3.perDay });
        } else {
          // Condition met, but Month 3 or its perDay is missing
          processingResults.push({ userId: user.id, status: 'no_month3_perDay', message: `Month 4 perDay is null, but valid Month 3 perDay not found.` });
        }
      } else {
        // Initial condition (Month 4 perDay null) not met
        processingResults.push({ userId: user.id, status: 'condition_not_met' });
      }
    }

    // 4. Perform Bulk Updates (Batched)
    for (let i = 0; i < usersToUpdate.length; i += BATCH_SIZE_UPDATES) {
      const updateBatch = usersToUpdate.slice(i, i + BATCH_SIZE_UPDATES);

      const updatePromises = updateBatch.map(async (updateInfo) => {
        try {
          await db.salary.updateMany({
            where: {
              userId: updateInfo.userId,
              month: { gte: 4, lte: 12 }, // Update months 4 to 11
              year: 2025,
            },
            data: {
              perDay: updateInfo.newPerDay,
            },
          });
          return { userId: updateInfo.userId, status: 'updated' as const };
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error(`Error updating salaries for user ${updateInfo.userId}:`, error);
          return { userId: updateInfo.userId, status: 'error' as const, message: error.message };
        }
      });

      const batchUpdateResults = await Promise.allSettled(updatePromises);

      // Add results from this update batch to the main results list
      batchUpdateResults.forEach(res => {
        if (res.status === 'fulfilled') {
          processingResults.push(res.value);
        } else {
          // This should ideally not happen if the inner try/catch works, but handle just in case
          console.error("Unhandled promise rejection during update:", res.reason);
          // Find which userId failed if possible, or add a generic error marker
        }
      });


      // Add delay between update batches
      if (i + BATCH_SIZE_UPDATES < usersToUpdate.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_UPDATE_BATCHES));
      }
    }

    // 5. Summarize
    const summary = {
      totalUsersChecked: users.length,
      usersAttemptedUpdate: usersToUpdate.length,
      successfulUpdates: processingResults.filter(r => r.status === 'updated').length,
      failedUpdates: processingResults.filter(r => r.status === 'error').length,
      conditionNotMet: processingResults.filter(r => r.status === 'condition_not_met').length,
      missingMonth3PerDay: processingResults.filter(r => r.status === 'no_month3_perDay').length,
      details: processingResults,
    };

    return NextResponse.json(summary, { status: 200 });

  } catch (error) { // Use unknown for better type safety
    console.error("Salary update operation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({
      error: `Salary update operation failed: ${errorMessage}`,
      status: "failed"
    }, { status: 500 });
  }
};
const userIds = [
  "cm7q3bct3003fgupnv5wua4cc",
  "cm7r43x80000egua3kmi1gq87",
  "cm7sy1m5t00c6gur22g16jj78",
  "cm7sy21x500chgur22mbj8zzi",
  "cm7sz8qor00efgur2sy5f8rcz",
  "cm7wnmlcx00dsgu01acq60d1w",
  "cm801eyiq004ygufj5bvsv4fx",
  "cm82jq518000kgu3607rz4f83",
  "cm845wkmu002kgus5rgrl94da",
  "cm875z0fu0098gutm5yc0bzxb",
  "cm87dl78b00btgutm8sjibxil",
  "cm6lm4hzw05noyyclydvvc1if"
];
export const POST = async (req: Request) => {
  try {
    // Extract user IDs from the request body instead of hardcoding
    const { userIds } = await req.json();

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return Response.json(
        { error: "Invalid or missing userIds in request body" },
        { status: 400 }
      );
    }

    const BATCH_SIZE = 3;
    const DELAY_BETWEEN_BATCHES = 1000; // 1 second
    const results = [];

    // Process in batches
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const userBatch = userIds.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        userBatch.map(async (userId) => {
          try {
            // Prepare data in a more concise way
            const data = Array.from({ length: 10 }, (_, index) => ({
              userId,
              month: index + 4, // Months 3-12
              year: 2025
            }));

            await db.salary.createMany({ data });

            return {
              userId,
              length: data.length,
              success: true,
            };
          } catch (err) {
            const error = err as Error;
            console.error(`Error processing user ${userId}:`, error);
            return {
              userId,
              error: error.message || "Unknown error occurred",
              success: false,
            };
          }
        })
      );

      results.push(...batchResults);

      // Add delay between batches to prevent rate limiting or DB overload
      if (i + BATCH_SIZE < userIds.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // Generate comprehensive summary with properly typed results
    const summary = {
      totalProcessed: results.length,
      successful: results.filter(
        (r) => r.status === "fulfilled" && r.value?.success
      ).length,
      failed: results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value?.success)
      ).length,
      details: results.map((r) =>
        r.status === "fulfilled"
          ? r.value
          : { error: r.reason instanceof Error ? r.reason.message : String(r.reason), success: false }
      ),
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.error("Main operation failed:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "failed",
      },
      { status: 500 },
    );
  }
};