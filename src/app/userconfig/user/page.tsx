'use client'

import { getUsers } from "@/action/dev/getUser";
import { useState } from "react";
import { DateTime } from "luxon";
import { AttendBranch, Attends, AttendStatus, Leave, Salary, User } from "@prisma/client";

import { TableAttendDev } from "@/components/dev/tableAttend";
import { TableLeaveDev } from "@/components/dev/tableLeave";
import { SalaryPerUser, SalaryPerUserProps } from "@/action/dev/calSalaryPerUser";
import { Modal2 } from "@/components/dev/modalDev";
interface datagetUsers {
    user: User,
    attend: Attends[],
    leave: Leave[],
    branch: AttendBranch,
    salary: Salary
}


export default function UserConfigUser() {
    const [user, setUser] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [isloading, seIsloading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [month, selectMonth] = useState(DateTime.now().toFormat('MM'));
    const [year, setYear] = useState(DateTime.now().toFormat('yyyy'));
    const [data, setData] = useState<datagetUsers | null>()
    const [openAddAttendModal, setOpenAddAttendModal] = useState<boolean>(false)
    const getdata = async () => {
        try {
            if (!user) {
                setError("Please enter a user")
                return
            }
            setError("")
            if (!type) {
                setError("Please enter a type")
                return
            }
            setError("")
            seIsloading(true)
            const result = await getUsers(user, type as "name" | "username", Number(month), Number(year));
            if (result.Error) {
                setData(null)
                setError(result.Error)
                return;
            }
            if (result.Success) {
                setSuccess(result.Success)
                setData(result.data)
                return
            }
            console.log("🚀 ~ getdata ~ result:", result)
        } catch (error) {
            console.log("🚀 ~ getdata ~ error:", error)
        } finally {
            seIsloading(false)
        }
    }
    const replaceAttendById = (idToReplace: string, newData: Attends) => {
        setData(prevData => {
            if (!prevData) return null;

            return {
                ...prevData,
                attend: prevData.attend.map(item =>
                    item.id === idToReplace ? newData : item
                ),
            };
        });
    };
    const CalculateSalary = async ({ userId, month, year }: SalaryPerUserProps) => {
        try {
            const result = await SalaryPerUser({ userId, month, year })
            if (result.success) {
                setData(prezData => {
                    if (!prezData) {
                        throw new Error("Cannot calculate salary without base user data");
                    }
                    return {
                        ...prezData,
                        salary: {
                            ...prezData.salary,
                            total: result.data?.totalSalary!,

                        }
                    }
                })
            }
        } catch (error) {

            console.log("🚀 ~ CalculateSalary ~ error:", error)

        }
    }
    const currentDate = new Date(`${year}-${month}-01`);
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    return (
        <>
            <div className="p-4">
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm w-full max-w-4xl mx-auto">
                    {/* Mobile: Stacked layout */}
                    <div className="md:hidden space-y-3">
                        <input
                            onChange={(e) => setUser(e.target.value)}
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary"
                        />

                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        id="name"
                                        value="name"
                                        className="mr-1"
                                        // checked={type === "name"}
                                        onChange={(e) => setType(e.target.value)}
                                    />
                                    <label htmlFor="name">Name</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        id="username"
                                        value="username"
                                        className="mr-1"
                                        // checked={type === "username"}
                                        onChange={(e) => setType(e.target.value)}
                                    />
                                    <label htmlFor="username">Username</label>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <select
                                    id="year"
                                    className="flex-1 rounded bg-white p-2 font-bold text-dark border border-stroke"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    <option value={new Date().getFullYear() - 1}>
                                        {new Date().getFullYear() - 1}
                                    </option>
                                    <option value={new Date().getFullYear()}>
                                        {new Date().getFullYear()}
                                    </option>
                                </select>

                                <select
                                    id="month"
                                    className="flex-1 rounded bg-white p-2 font-bold uppercase text-dark border border-stroke"
                                    value={month}
                                    onChange={(e) => selectMonth(e.target.value)}
                                >
                                    <option value="01">Jan</option>
                                    <option value="02">Feb</option>
                                    <option value="03">Mar</option>
                                    <option value="04">Apr</option>
                                    <option value="05">May</option>
                                    <option value="06">Jun</option>
                                    <option value="07">Jul</option>
                                    <option value="08">Aug</option>
                                    <option value="09">Sep</option>
                                    <option value="10">Oct</option>
                                    <option value="11">Nov</option>
                                    <option value="12">Dec</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                            onClick={getdata}
                        >
                            Search
                        </button>
                    </div>

                    {/* Desktop: Horizontal layout */}
                    <div className="hidden md:flex flex-row items-center gap-3">
                        <input
                            onChange={(e) => setUser(e.target.value)}
                            type="text"
                            placeholder="Search..."
                            className="flex-1 rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary"
                        />

                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    id="name-desktop"
                                    value="name"
                                    className="mr-1"
                                    // checked={type === "name"}
                                    onChange={(e) => setType(e.target.value)}
                                />
                                <label htmlFor="name-desktop">Name</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    id="username-desktop"
                                    value="username"
                                    className="mr-1"
                                    // checked={type === "username"}
                                    onChange={(e) => setType(e.target.value)}
                                />
                                <label htmlFor="username-desktop">Username</label>
                            </div>
                        </div>

                        <select
                            id="year-desktop"
                            className="rounded bg-white p-2 pr-5 font-bold text-dark border border-stroke"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value={new Date().getFullYear() - 1}>
                                {new Date().getFullYear() - 1}
                            </option>
                            <option value={new Date().getFullYear()}>
                                {new Date().getFullYear()}
                            </option>
                        </select>

                        <select
                            id="month-desktop"
                            className="rounded bg-white p-2 font-bold uppercase text-dark border border-stroke"
                            value={month}
                            onChange={(e) => selectMonth(e.target.value)}
                        >
                            <option value="01">Jan</option>
                            <option value="02">Feb</option>
                            <option value="03">Mar</option>
                            <option value="04">Apr</option>
                            <option value="05">May</option>
                            <option value="06">Jun</option>
                            <option value="07">Jul</option>
                            <option value="08">Aug</option>
                            <option value="09">Sep</option>
                            <option value="10">Oct</option>
                            <option value="11">Nov</option>
                            <option value="12">Dec</option>
                        </select>

                        <button
                            type="button"
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                            onClick={getdata}
                        >
                            Search
                        </button>
                    </div>

                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
            <div className="p-4 flex justify-center">  {/* Added flex justify-center here */}
                <div className="inline-flex items-center bg-white rounded-lg shadow-sm px-4">  {/* Added px-4 for better padding */}
                    <div className="flex flex-row space-x-4 h-[2.5rem] items-center">
                        <div>
                            Name: {data?.user.name}
                        </div>
                        <div>
                            Username: {data?.user.username}
                        </div>
                        <div>
                            id : {data?.user.id}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 flex flex-row justify-center space-x-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div>
                        <p>Shift</p>
                        <p>In : {data?.branch.clockIn}</p>
                        <p>Out: {data?.branch.clockOut}</p>
                        {/* <button className="bg-blue-600 rounded-md p-2 text-white">Change shift</button> */}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div>
                        <p>Salary</p>
                        <p>Total Day : {data?.salary.workingDay} / {daysInCurrentMonth}</p>
                        <p>Total: {data?.salary.total}</p>
                        <button
                            onClick={() => {
                                CalculateSalary({ userId: data?.user.id!, month: Number(month), year: Number(year) })
                            }}
                            className="bg-blue-600 rounded-md p-2 text-white">Calculate Salary</button>
                    </div>
                </div>
            </div>
            <div className="p-4 ">
                {isloading && (<><p className="text-blue-600">Loading...</p></>)}
                {error && (<><p className="text-red-600">{error}</p></>)}
                <button
                    className="bg-blue-600 rounded-md p-2 text-white m-4"
                    onClick={() => { setOpenAddAttendModal(true) }}
                    disabled={data ? false : true}
                >Add Attend</button>
                <div className="bg-white rounded-lg shadow-sm">

                    {success && (<>

                        {data && <TableAttendDev attends={data?.attend!} onSave={replaceAttendById} />}
                    </>)}

                </div>
                <div>
                    {success && (<>

                        {data && <TableLeaveDev leaves={data?.leave!} />}
                    </>)}

                </div>
            </div>
            <Modal2 isOpen={openAddAttendModal} onClose={() => setOpenAddAttendModal(false)} title="Edit Attendance">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type='date'


                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Clock In:</label>
                        <input
                            type="time"
                            // value={

                            // }
                            // onChange={(e) => {
                            //     if (!data) return;
                            //     const [hours, minutes] = e.target.value.split(":").map(Number);
                            //     const newDate = new Date(data.dates!);
                            //     newDate.setHours(hours);
                            //     newDate.setMinutes(minutes);
                            //     setData({
                            //         ...data,
                            //         clockIn: newDate
                            //     });
                            // }}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Clock Out:</label>
                        <input
                            type="time"
                            // value={
                            //     data?.clockOut
                            //         ? new Date(data.clockOut).toLocaleTimeString([], {
                            //             hour: '2-digit',
                            //             minute: '2-digit',
                            //             hour12: false
                            //         }).replace(/^24:/, '00:')
                            //         : ""
                            // }
                            // onChange={(e) => {
                            //     if (!data) return;
                            //     const [hours, minutes] = e.target.value.split(":").map(Number);
                            //     const newDate = new Date(data.dates!);
                            //     newDate.setHours(hours);
                            //     newDate.setMinutes(minutes);
                            //     setData({
                            //         ...data,
                            //         clockOut: newDate
                            //     });
                            // }}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status:</label>
                        <select
                            // value={data?.status}
                            name="status"
                            id="status"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        // onChange={(e) => {
                        //     if (!data) return;
                        //     setData({ ...data, status: e.target.value as AttendStatus });
                        // }}
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
                        onClick={(e) => { e.preventDefault(); setOpenAddAttendModal(false) }}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={(e) => {

                            // editData(data!)
                        }}
                        // disabled={isSubmitting}
                        className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {/* {isSubmitting ? "Submitting..." : "Submit"} */}
                        Add
                    </button>
                </div>
            </Modal2>
        </>
    )
}