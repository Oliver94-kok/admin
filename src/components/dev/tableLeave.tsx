'use client'



import { Leave } from "@prisma/client"
import { useEffect, useState } from "react"
import { DateTime } from "luxon";
interface TableLeaveDevProps {
    leaves: Leave[]
}

export const TableLeaveDev = ({ leaves }: TableLeaveDevProps) => {

    const displayTime = (clock: Date | null) => {
        // const dateTime = DateTime.fromISO(clock);
        const dateTime = DateTime.fromJSDate(new Date(clock!));
        return dateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
    };
    const displaydate = (clock: any) => {
        // const dateTime = DateTime.fromISO(clock);
        const dateTime = DateTime.fromJSDate(new Date(clock!));
        return dateTime.toFormat('dd-MM-yyyy')
    };

    return (
        <>
            <div className="overflow-x-auto p-4">
                <table className="table-auto w-full ">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Clock In</th>
                            <th className="px-4 py-2">Clock Out</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>

                        {leaves.map((leave) => (
                            <>
                                <tr key={leave.id} className="border">
                                    <td>{displaydate(leave.createdAt)}</td>
                                    <td>{leave.startDate}</td>
                                    <td>{leave.endDate}</td>
                                    <td>{leave.status}</td>
                                    <td className="flex gap-2">
                                        {/* <button>Delete</button> */}
                                        <button>Edit</button>
                                    </td>
                                </tr>

                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}