"use server";

import { db } from "@/lib/db";
import { getAllresultAttend } from "@/lib/salaryPrintService";
import { Salary, SalaryRecord } from "@/types/salary2";
import axios from "axios";
import { cookies } from "next/headers";

export async function setDataCookies(data: any) {
  cookies().delete("pageData");
  console.log("🚀 ~ setDataCookies ~ data:", data);
  cookies().set("pageData", JSON.stringify(data));
}
export async function getData(): Promise<SalaryRecord[]> {
  const cookie = cookies().get("pageData");

  // Early return if no cookie data
  if (!cookie || !cookie.value) {
    return [];
  }

  let ids: string[];
  try {
    ids = JSON.parse(cookie.value);

    // Validate that ids is an array
    if (!Array.isArray(ids)) {
      console.error("Cookie data is not an array");
      return [];
    }
  } catch (error) {
    console.error("Failed to parse cookie data:", error);
    return [];
  }

  // Batch processing with controlled concurrency
  const BATCH_SIZE = 3; // Adjust based on your connection pool
  const results: SalaryRecord[] = [];

  // Process ids in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    // Get a batch of ids
    const batchIds = ids.slice(i, i + BATCH_SIZE);

    // Process current batch
    const batchResults = await Promise.all(
      batchIds.map(async (id) => {
        try {
          const salary = await db.salary.findFirst({
            where: { id },
            select: {
              id: true,
              month: true,
              year: true,
              workingDay: true,
              workingHoour: true,
              fineLate: true,
              fineNoClockIn: true,
              fineNoClockOut: true,
              late: true,
              notClockIn: true,
              overTimeHour: true,
              overTime: true,
              total: true,
              perDay: true,
              bonus: true,
              allowance: true,
              cover: true,
              userId: true,
              advances: true,
              transport: true,
              short: true,
              m: true,
              users: {
                select: {
                  name: true,
                  AttendBranch: {
                    select: {
                      team: true,
                      branch: true,
                      clockIn: true,
                      clockOut: true,
                    },
                  },
                },
              },
            },
          });

          if (!salary) return null;

          // Ensure users and AttendBranch are properly mapped
          const mappedSalary: Salary = {
            ...salary,
            users: salary.users
              ? {
                  name: salary.users.name,
                  AttendBranch: salary.users.AttendBranch
                    ? {
                        team: salary.users.AttendBranch.team,
                        branch: salary.users.AttendBranch.branch,
                        clockIn: salary.users.AttendBranch.clockIn,
                        clockOut: salary.users.AttendBranch.clockOut,
                      }
                    : null,
                }
              : null,
          };

          const result = await getAllresultAttend(
            salary.userId!,
            salary.month!,
            salary.year!,
          );

          // Ensure the entire record matches SalaryRecord
          const completeRecord: SalaryRecord = {
            salary: mappedSalary,
            result,
          };

          return completeRecord;
        } catch (error) {
          console.error(`Error processing id ${id}:`, error);
          return null;
        }
      }),
    );

    // Add non-null results to the main results array
    results.push(
      ...batchResults.filter(
        (result): result is SalaryRecord => result !== null,
      ),
    );

    // Optional: Add a small delay between batches to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
