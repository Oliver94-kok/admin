'use client'

import { getUsers } from "@/action/dev/getUser";
import { useState } from "react";
import { DateTime } from "luxon";
import { AttendBranch, Attends, Leave, Salary, User } from "@prisma/client";

import { TableAttendDev } from "@/components/dev/tableAttend";
import { TableLeaveDev } from "@/components/dev/tableLeave";
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
    const currentDate = new Date();
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
                        <button className="bg-blue-600 rounded-md p-2 text-white">Calculate Salary</button>
                    </div>
                </div>
            </div>
            <div className="p-4 ">
                {isloading && (<><p className="text-blue-600">Loading...</p></>)}
                {error && (<><p className="text-red-600">{error}</p></>)}
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
        </>
    )
}