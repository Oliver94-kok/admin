import { getDataUser } from "@/action/getUserData";
import { calculateOvertimeHours } from "@/data/attend";
import { getAttendLate } from "@/data/salary";
import { db } from "@/lib/db";
import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";

export const GET = async (request: Request) => {
  try {
    // Get all users from team D
    const users = await db.user.findMany({
      where: { AttendBranch: { team: "A" } },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          // Get the perDay value for month 2 (February)
          const februarySalary = await db.salary.findFirst({
            where: { userId: user.id, month: 2 },
            select: { perDay: true }
          });

          if (!februarySalary) {
            return {
              userId: user.id,
              type: "error",
              error: "No February salary record found",
              created: false,
            };
          }

          // Get all salary records for this user
          const salaryRecords = await db.salary.findMany({
            where: { userId: user.id }
          });

          // Run all updates concurrently and wait for them to complete
          await Promise.all(
            salaryRecords.map(salaryRecord =>
              db.salary.update({
                where: { id: salaryRecord.id },
                data: { perDay: februarySalary.perDay }
              })
            )
          );

          return {
            userId: user.id,
            type: "success",
            created: true,
            length: salaryRecords.length,
          };
        } catch (error) {
          return {
            userId: user.id,
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            created: false,
          };
        }
      })
    );

    // Process results
    const processedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          userId: "unknown",
          type: "error",
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          created: false,
        };
      }
    });

    // Build summary with only valid types that exist in our results
    const successfulResults = processedResults.filter(r => r.type === "success");
    const failedResults = processedResults.filter(r => r.type === "error");

    const summary = {
      total: users.length,
      successful: successfulResults.length,
      failed: failedResults.length,
      // successDetails: successfulResults,
      failureDetails: failedResults,
    };

    return Response.json(summary, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
};
export const POST = async (req: Request) => {
  try {
    // Hardcoded user IDs (consider getting these from the request body instead)
    const userIds = [
      "cm43y1to6000eth7w6aohmjnr",
      "cm43y2sal000lth7waaehk0lj",
      "cm43y5uzf001kth7wtqtecdo8",
      "cm43y7x39002cth7wn4mc6nta",
    ];

    const results = await Promise.allSettled(
      userIds.map(async (userId) => {
        try {
          // Get February salary record
          const februarySalary = await db.salary.findFirst({
            where: { userId, month: 2 },
            select: { perDay: true }
          });

          // Handle missing February salary
          if (!februarySalary) {
            return {
              userId,
              status: "error",
              message: "No February salary record found"
            };
          }

          // Get all salary records for this user
          const salaryRecords = await db.salary.findMany({
            where: { userId }
          });

          // Update all salary records with February's perDay value
          await Promise.all(
            salaryRecords.map(salaryRecord =>
              db.salary.update({
                where: { id: salaryRecord.id },
                data: { perDay: februarySalary.perDay }
              })
            )
          );

          // Return success information
          return {
            userId,
            status: "success",
            updatedRecords: salaryRecords.length
          };
        } catch (error) {
          // Handle errors within the map function
          return {
            userId,
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error"
          };
        }
      })
    );

    // Process results for summary
    const processedResults = results.map(result => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          userId: "unknown",
          status: "error",
          message: result.reason instanceof Error ? result.reason.message : String(result.reason)
        };
      }
    });

    // Create a summary
    const summary = {
      total: userIds.length,
      successful: processedResults.filter(r => r.status === "success").length,
      failed: processedResults.filter(r => r.status === "error").length
    };

    // Return meaningful response
    return Response.json({
      status: "success",
      summary,
      results: processedResults
    }, { status: 200 });
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
