'use client'



import { Attends, AttendStatus } from "@prisma/client"
import { useEffect, useState } from "react"
import { DateTime } from "luxon";
import Modal from "../modal";
import dayjs from "dayjs";
import { Modal2 } from "./modalDev";
import { editAttend } from "@/action/dev/editAttend";
import { on } from "events";
interface TableAttendDevProps {
    attends: Attends[];
    onSave: (id: string, data: Attends) => void
}

export const TableAttendDev = ({ attends, onSave }: TableAttendDevProps) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [data, setData] = useState<Attends | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const displaynull = (a: Attends, type: "In" | "out") => {
        // First handle special statuses
        if (a.status == "Leave" || a.status == "OffDay" || a.status == "Absent") {
            return a.status;
        }

        // For Active status or when checking specific clock types
        if (type == 'In') {
            if (a.clockIn != null) {
                return displayTime(a.clockIn);
            }
            return a.status == "Active" ? "Not Clocked In" : "Not Clock";
        }

        if (type == 'out') {
            if (a.clockOut != null) {
                return displayTime(a.clockOut);
            }
            // If Active status and no clockOut, but has clockIn
            if (a.status == "Active" && a.clockIn != null) {
                return "Still Working"; // or "Active", or whatever you prefer
            }
            return "Not Clocked Out";
        }

        // Default return (shouldn't reach here)
        return "N/A";
    }
    const editData = async (attend: Attends) => {

        try {
            setIsSubmitting(true);
            const result = await editAttend(attend)
            if (result.error) {
                alert(result.error);
                return
            }
            if (result.success) {
                onSave(attend.id, result.result);
                return
            }

        } catch (error) {

        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <>
            <div className="overflow-x-auto p-4">
                <table className="table-auto w-full hidden md:table ">
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

                        {attends.map((attend) => (
                            <>
                                <tr key={attend.id} className="border">
                                    <td>{displaydate(attend.dates)}</td>
                                    <td>{displaynull(attend, 'In')}</td>
                                    <td>{displaynull(attend, 'out')}</td>
                                    <td>{attend.status}</td>
                                    <td className="flex gap-2">
                                        {/* <button>Delete</button> */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsEditOpen(true);
                                                setData(attend);
                                            }}
                                        >Edit</button>
                                    </td>
                                </tr>

                            </>
                        ))}
                    </tbody>
                </table>
                <div className="md:hidden ">
                    {attends.map((attend) => (
                        <>
                            <div key={attend.id} className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    <div className="col-span-2 font-medium text-gray-700">Date: {displaydate(attend.dates)}</div>

                                    <div>
                                        <span className="text-sm text-gray-500">Clock In:</span>
                                        <p className="font-medium">{displaynull(attend, 'In') || '--:--'}</p>
                                    </div>

                                    <div>
                                        <span className="text-sm text-gray-500">Clock Out:</span>
                                        <p className="font-medium">{displaynull(attend, 'out') || '--:--'}</p>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-sm text-gray-500">Status:</span>
                                        <p className={`font-medium ${attend.status}`}>
                                            {attend.status || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsEditOpen(true);
                                            setData(attend);
                                        }}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </>
                    ))}

                </div>
                <Modal2 isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Attendance">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="text"
                                value={
                                    data?.dates
                                        ? DateTime.fromJSDate(data.dates, { zone: "utc" })
                                            .toLocal()
                                            .toFormat("yyyy-MM-dd")
                                        : ""
                                }
                                disabled
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clock In:</label>
                            <input
                                type="time"
                                value={
                                    data?.clockIn
                                        ? new Date(data.clockIn).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        }).replace(/^24:/, '00:')
                                        : ""
                                }
                                onChange={(e) => {
                                    if (!data) return;
                                    const [hours, minutes] = e.target.value.split(":").map(Number);
                                    const newDate = new Date(data.dates!);
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    setData({
                                        ...data,
                                        clockIn: newDate
                                    });
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clock Out:</label>
                            <input
                                type="time"
                                value={
                                    data?.clockOut
                                        ? new Date(data.clockOut).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        }).replace(/^24:/, '00:')
                                        : ""
                                }
                                onChange={(e) => {
                                    if (!data) return;
                                    const [hours, minutes] = e.target.value.split(":").map(Number);
                                    const newDate = new Date(data.dates!);
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    setData({
                                        ...data,
                                        clockOut: newDate
                                    });
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status:</label>
                            <select
                                value={data?.status}
                                name="status"
                                id="status"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                onChange={(e) => {
                                    if (!data) return;
                                    setData({ ...data, status: e.target.value as AttendStatus });
                                }}
                            >
                                {Object.entries(AttendStatus).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {value.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setIsEditOpen(false) }}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={(e) => {

                                editData(data!)
                            }}
                            disabled={isSubmitting}
                            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </Modal2>
            </div>
        </>
    )
}