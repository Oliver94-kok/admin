'use client'

import { getUsers } from "@/action/dev/getUser";
import { useState } from "react";
import { DateTime } from "luxon";
import { Attends, Leave, User } from "@prisma/client";

import { TableAttendDev } from "@/components/dev/tableAttend";
import { TableLeaveDev } from "@/components/dev/tableLeave";
interface datagetUsers {
    user: User,
    attend: Attends[],
    leave: Leave[]
}


export default function UserConfigUser() {
    const [user, setUser] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [isloading, seIsloading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [month, selectMonth] = useState(DateTime.now().toFormat('MM'));
    const [year, setYear] = useState(DateTime.now().toFormat('yyyy'));
    const [data, setData] = useState<datagetUsers>()
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
    return (
        <>
            <div className="p-4">

                <div className="mt-4 bg-white ml-2 w-[50rem] p-4 rounded-lg shadow-sm">
                    <div className="flex flex-row items-center gap-4">
                        <input
                            onChange={(e) => setUser(e.target.value)}
                            type="text"
                            placeholder="Search..."
                            className="flex-1 rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
                        />

                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <input type="radio" name="type" id="name" value="name" className="mr-1" onChange={(e) => setType(e.target.value)} />
                                <label htmlFor="name">Name</label>
                            </div>
                            <div className="flex items-center">
                                <input type="radio" name="type" id="username" value="username" className="mr-1" onChange={(e) => setType(e.target.value)} />
                                <label htmlFor="username">Username</label>
                            </div>
                        </div>
                        <select
                            id="year"
                            className="rounded bg-white p-2 pr-5  font-bold text-dark dark:bg-gray-dark dark:text-white"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            {/* Add year options */}
                            <option value={new Date().getFullYear() - 1}>
                                {new Date().getFullYear() - 1}
                            </option>
                            <option value={new Date().getFullYear()}>
                                {new Date().getFullYear()}
                            </option>
                        </select>

                        {/* Month selection dropdown with Check button beside it */}
                        <select
                            id="month"
                            className="ml-5 mr-5 rounded bg-white p-2 font-bold uppercase text-dark dark:border-gray-600 dark:bg-gray-dark dark:text-white"
                            // defaultValue={String(new Date().getMonth() + 1).padStart(2, '0')}  // Set default to current month
                            value={month}
                            onChange={(e) => selectMonth(e.target.value)}
                        >
                            {/* Add month options */}
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
                            type="submit"
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
            <div className="p-4 ">
                {isloading && (<><p className="text-blue-600">Loading...</p></>)}
                {error && (<><p className="text-red-600">{error}</p></>)}
                <div className="bg-white rounded-lg shadow-sm">

                    {success && (<>

                        <TableAttendDev attends={data?.attend!} />
                    </>)}

                </div>
                <div>
                    {success && (<>

                        <TableLeaveDev leaves={data?.leave!} />
                    </>)}

                </div>
            </div>
        </>
    )
}