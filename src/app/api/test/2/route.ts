import { getDataUser } from "@/action/getUserData";
import { calculateOvertimeHours } from "@/data/attend";
import { getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";

export const GET = async (request: Request) => {
  try {
    // Extract query parameters if needed
    const url = new URL(request.url);
    const minSalaryEntries = parseInt(url.searchParams.get('minEntries') || '10');
    const batchSize = parseInt(url.searchParams.get('batchSize') || '3');
    const delayMs = parseInt(url.searchParams.get('delay') || '1000');

    // Get active users with role "USER"
    const users = await db.user.findMany({
      where: {
        role: "USER",
        isDelete: false
      },
      select: {
        id: true,
        name: true,  // Optional: include name for better identification
      },
    });

    if (users.length === 0) {
      return Response.json({
        message: "No active users found",
        totalProcessed: 0
      }, { status: 200 });
    }

    const results = [];

    // Process in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const userBatch = users.slice(i, i + batchSize);

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        userBatch.map(async (user) => {
          try {
            // Use count instead of findMany for better performance when we only need the count
            const salaryCount = await db.salary.count({
              where: { userId: user.id }
            });

            // Check if user has fewer salary entries than required
            const hasSufficientEntries = salaryCount >= minSalaryEntries;

            return {
              userId: user.id,
              name: user.name,  // Optional: include if selected above
              salaryEntries: salaryCount,
              sufficient: hasSufficientEntries,
              success: true
            };
          } catch (err) {
            const error = err as Error;
            console.error(`Error checking salary entries for user ${user.id}:`, error);
            return {
              userId: user.id,
              name: user.name,  // Optional: include if selected above
              error: error.message || "Unknown error occurred",
              success: false,
            };
          }
        })
      );

      results.push(...batchResults);

      // Add delay between batches to prevent rate limiting
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // Generate summary with improved typing
    const insufficientEntryUsers = results
      .filter(r => r.status === "fulfilled" && r.value.success && !r.value.sufficient)
      .map(r => (r as PromiseFulfilledResult<any>).value);

    const summary = {
      totalProcessed: results.length,
      usersWithInsufficientEntries: insufficientEntryUsers.length,
      usersWithSufficientEntries: results.filter(
        r => r.status === "fulfilled" && r.value.success && r.value.sufficient
      ).length,
      processingErrors: results.filter(
        r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
      ).length,
      insufficientEntryUsers,
      processingErrorDetails: results
        .filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success))
        .map(r => r.status === "fulfilled" ? r.value : { error: r.reason instanceof Error ? r.reason.message : String(r.reason) })
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    console.error("Salary check operation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return Response.json({
      error: errorMessage,
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
              month: index + 3, // Months 3-12
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