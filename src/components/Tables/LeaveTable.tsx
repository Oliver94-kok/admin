// src/components/LeaveTable.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Leave } from "@/types/product";
import Modal from "../modal";
import { fullLeaveTypes, LeavesInterface } from "@/types/leave";
import { ApproveLeave } from "@/action/approveLeave";
import { roleAdmin, SentNoti } from "@/lib/function";
import { DateTime } from "luxon";
import { mutate } from "swr";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ApproveLeaveV2 } from "@/action/approveLeave_v2";
import { useSession } from "next-auth/react";
import { getUserLeave } from "@/data/user";
import Select from 'react-select'
import { AddLeaveUser, AddUserLeave } from "@/action/addLeave";
import { IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
interface LeaveTableInterface {
  data: LeavesInterface[];
}
const dictionaries = {
  en: () => import('../../locales/en/lang.json').then((module) => module.default),
  zh: () => import('../../locales/zh/lang.json').then((module) => module.default),
};

interface UserLeave {
  value: string;
  label: string;
}
interface Users {
  id: string;
  username: string;
  AttendBranch: {
    clockIn: string | null;
    clockOut: string | null;
  } | null;
}

const LeaveTable = ({ data }: LeaveTableInterface) => {
  const session = useSession();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<"Approve" | "Reject" | "Delete" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dict, setDict] = useState<any>(null); // State to hold the dictionary
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Add sort order state
  const [sortColumn, setSortColumn] = useState<string | null>(null); // Add sort column state
  const itemsPerPage = 10;
  const [dataLeave, setDataLeave] = useState(data);
  const [leaveId, setLeaveId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [userLeaveData, setUserLeaveData] = useState<UserLeave[]>([]);
  const [users, setUsers] = useState<Users[]>([])
  const [shiftTimeIn, setShiftTimein] = useState("")
  const [shiftTimeOut, setShiftTimeOut] = useState("")
  const [totaldays, setTotaldays] = useState(0);
  const totalPages = Math.ceil(dataLeave.length / itemsPerPage);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const MAX_VISIBLE_PAGES = 20;

  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage =
      Math.floor((currentPage - 1) / MAX_VISIBLE_PAGES) * MAX_VISIBLE_PAGES + 1;
    const endPage = Math.min(startPage + MAX_VISIBLE_PAGES - 1, totalPages);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const visiblePages = getVisiblePages();

  useEffect(() => {
    if (data) {
      setDataLeave(data);
      getUser()
    }
  }, [data]);
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateShiftLeaveDuration2(
        startDate,
        endDate,

      );
      setTotaldays(days);
    }
  }, [startDate, endDate]);
  const getUser = async () => {
    try {
      let admin_role = session.data?.user.role!;

      let role;
      if (admin_role != "ADMIN") {
        role = await roleAdmin(admin_role);
      } else {
        role = "ADMIN";
      }

      const result = await getUserLeave(role);;
      console.log("🚀 ~ getUser ~ data:", data)
      setUserLeaveData(result?.data || [])
      setUsers(result?.users || [])
    } catch (error) {
      console.log(error)
    }
  }
  // Function to handle sorting
  const handleSort = (column: string) => {
    const newSortOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newSortOrder);
  };

  const getLocale = (): 'en' | 'zh' => {
    // Get the locale from localStorage, default to 'en' if null
    const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    return (locale === 'en' || locale === 'zh') ? locale : 'en'; // Ensure it's either 'en' or 'zh'
  };

  // Dynamically load the dictionary based on the current locale
  useEffect(() => {
    const locale = getLocale(); // Get the valid locale
    dictionaries[locale]().then((languageDict) => {
      setDict(languageDict); // Set the dictionary in the state
    });
  }, []);

  if (!dict) return <div>Loading...</div>; // Show a loading state until the dictionary is loaded

  // Sort the filtered data
  const sortedData = [...dataLeave].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof LeavesInterface];
    const bValue = b[sortColumn as keyof LeavesInterface];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // Paginate the data
  const filteredData = sortedData.filter((attend) => {
    // if (attend.name && attend.username && attend.workingHour) {
    const searchText = searchQuery.toLowerCase(); // Lowercase searchQuery once
    return (
      attend.users?.name.toLowerCase().includes(searchText) ||
      attend.users?.username.toLowerCase().includes(searchText)
    );
    //   attend?.workingHour.toString().includes(searchText);
    // }
    // return false; // Explicitly return false to avoid accidental inclusions
  });
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (leaveId: string) => {
    try {
      const checkResponse = await fetch(`/api/leave/${leaveId}/check`, {
        method: "GET",
      });
      const checkData = await checkResponse.json();

      if (checkData.hasPreviousData) {
        const restoreResponse = await fetch(`/api/leave/${leaveId}/restore`, {
          method: "POST",
        });
        const restoreData = await restoreResponse.json();

        if (restoreData.success) {
          toast.success("Leave restored successfully", { position: "top-center" });
        } else {
          toast.error("Failed to restore leave", { position: "top-center" });
        }
      } else {
        const deleteResponse = await fetch(`/api/leave/${leaveId}`, {
          method: "DELETE",
        });
        const deleteData = await deleteResponse.json();

        if (deleteData.success) {
          toast.success("Leave deleted successfully", { position: "top-center" });
        } else {
          toast.error("Failed to delete leave", { position: "top-center" });
        }
      }
    } catch (error) {
      toast.error("An error occurred", { position: "top-center" });
      console.error(error);
    }
  };

  const handleConfirmOpen = (action: "Approve" | "Reject", id: string) => {
    setLeaveId(id);
    setCurrentAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    // Reset current action if needed
    setCurrentAction(null);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !startDate || !endDate || !leaveType || !reason) {
      alert("Please fill in all required fields.");
      return;
    }
    if (totaldays == 0) {
      alert("Leave day is 0");
      return;
    }

    const newLeave: AddUserLeave = {
      userId: selectedUser,
      startDate,
      endDate,
      duration: totaldays,
      leaveType,
      reason,
    };
    const result = await AddLeaveUser(newLeave)
    if (result.error) {
      toast.error(result.error, { position: "top-center" })
    }
    if (result.Success) {
      toast.success('Success add leave', { position: "top-center" })
      setStartDate(null);
      setEndDate(null);
      setTotaldays(0);
      setReason('');
      setLeaveType('')

      setIsModalOpen(false);
    }


  };

  const handleConfirm = async () => {
    ApproveLeaveV2(currentAction == "Approve" ? "Approve" : "Reject", leaveId).then(async (data) => {
      if (data.error) {
        toast.error(data.error, {
          position: "top-center",
        });
        return;
      }
      if (data.success) {
        toast.success("Success add status", {
          position: "top-center",
        });
      }

    })


    console.log(`Action: ${currentAction}, Leave ID: ${leaveId}`);
    handleConfirmClose();
  };
  function calculateShiftLeaveDuration2(
    leaveStart: Date,
    leaveEnd: Date,

  ): number {
    // 1. Parse shift times
    const [shiftStartH, shiftStartM] = shiftTimeIn.split(':').map(Number);
    const [shiftEndH, shiftEndM] = shiftTimeOut.split(':').map(Number);

    // 2. Calculate shift duration in hours
    let shiftDuration = (shiftEndH - shiftStartH) + (shiftEndM - shiftStartM) / 60;
    if (shiftDuration <= 0) shiftDuration += 24; // Handle overnight shifts
    const halfShift = shiftDuration / 2;

    // 3. Initialize counters
    let totalDays = 0;
    const currentDay = new Date(leaveStart);
    currentDay.setHours(0, 0, 0, 0);

    // 4. Process each day
    while (currentDay <= leaveEnd) {
      // Calculate shift start/end for current day
      const dayStart = new Date(currentDay);
      dayStart.setHours(shiftStartH, shiftStartM, 0, 0);

      const dayEnd = new Date(currentDay);
      dayEnd.setHours(shiftEndH, shiftEndM, 0, 0);
      if (shiftEndH < shiftStartH) dayEnd.setDate(dayEnd.getDate() + 1); // Overnight

      // Adjust for leave boundaries
      const actualStart = new Date(Math.max(leaveStart.getTime(), dayStart.getTime()));
      const actualEnd = new Date(Math.min(leaveEnd.getTime(), dayEnd.getTime()));

      // Calculate hours covered
      const hoursCovered = (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);

      // Count days
      if (hoursCovered >= shiftDuration * 0.9) { // 90% threshold for full day
        totalDays += 1;
      } else if (hoursCovered >= halfShift) {
        totalDays += 0.5;
      }

      // Move to next day
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return totalDays;
  }



  return (
    <div
      className="responsive-container shadow-1 dark:bg-gray-dark dark:shadow-card"
    >
      {/* Search Input */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            {dict.leave.userleave}
          </h4>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 p-2 text-white hover:from-blue-600 hover:to-blue-800 transition transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <div className="relative w-full max-w-[414px]">
          <input
            className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
            placeholder={dict.dashboard.search}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white">
            <svg
              className="fill-current"
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.25 3C5.3505 3 3 5.3505 3 8.25C3 11.1495 5.3505 13.5 8.25 13.5C11.1495 13.5 13.5 11.1495 13.5 8.25C13.5 5.3505 11.1495 3 8.25 3ZM1.5 8.25C1.5 4.52208 4.52208 1.5 8.25 1.5C11.9779 1.5 15 4.52208 15 8.25C15 11.9779 11.9779 15 8.25 15C4.52208 15 1.5 11.9779 1.5 8.25Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.958 11.957C12.2508 11.6641 12.7257 11.6641 13.0186 11.957L16.2811 15.2195C16.574 15.5124 16.574 15.9872 16.2811 16.2801C15.9882 16.573 15.5133 16.573 15.2205 16.2801L11.958 13.0176C11.6651 12.7247 11.6651 12.2499 11.958 11.957Z"
              />
            </svg>
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-dark-2">
            <h2 className="mb-4 text-xl font-semibold text-dark dark:text-white">{dict.leave.addleave}</h2>

            <div className="space-y-4">
              {/* Username Select */}
              <div>
                <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-white">{dict.leave.username}</label>
                <Select options={userLeaveData} onChange={(e) => {
                  setSelectedUser(e?.value!);
                  let u = users.find((user) => user.id === e?.value)
                  setShiftTimein(u?.AttendBranch?.clockIn!)
                  setShiftTimeOut(u?.AttendBranch?.clockOut!)
                }} />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-white">{dict.leave.startdate}</label>
              <DatePicker
                selected={startDate as Date | null}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-full rounded border border-stroke px-4 py-2 dark:bg-dark-1 dark:text-white"
              />
              shift in: {shiftTimeIn}
            </div>


            {/* End Date */}
            <div>
              <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-white">{dict.leave.enddate}</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => { setEndDate(date); }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-full rounded border border-stroke px-4 py-2 dark:bg-dark-1 dark:text-white"
              />
              shift out: {shiftTimeOut}
            </div>

            {/* Total Leave Days   */}
            {startDate && endDate && (
              <div className="mt-2 text-sm text-gray-700 dark:text-white">
                {/* {dict.leave.totalleaveday}: {getLeaveDuration()} day(s) */}
                {dict.leave.totalleaveday}: {totaldays} day(s)
              </div>
            )}

            {/* Leave Type */}
            <div>
              <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-white">{dict.leave.leavetype}</label>
              <select
                className="w-full rounded border border-stroke bg-white px-4 py-2 pr-10 dark:bg-dark-1 dark:text-white"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="">{dict.leave.selecttype}</option>
                <option value={dict.leave.paidleave}>{dict.leave.paidleave}</option>
                <option value={dict.leave.unpaidleave}>{dict.leave.unpaidleave}</option>
                <option value={dict.leave.emergencyleave}>{dict.leave.emergencyleave}</option>
                <option value={dict.leave.bereavementleave}>{dict.leave.bereavementleave}</option>
                <option value={dict.leave.medicalleave}>{dict.leave.medicalleave}</option>
                <option value={dict.leave.annualleave}>{dict.leave.annualleave}</option>
                <option value={dict.leave.forgetclock}>{dict.leave.forgetclock}</option>
                <option value={dict.leave.delivery}>{dict.leave.delivery}</option>
                {/*fullLeaveTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))*/}
              </select>

              {/* Reason */}
              <div>
                <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-white">{dict.leave.reason}</label>
                <textarea
                  className="w-full rounded border border-stroke px-4 py-2 dark:bg-dark-1 dark:text-white"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="E.g., Sick, Personal, etc."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setStartDate(null);
                  setEndDate(null);
                  setTotaldays(0);
                  setReason('');
                  setLeaveType('');
                  setShiftTimeOut(''); setShiftTimein('')
                }}
                className="font-medium text-black underline hover:text-black"
              >
                {dict.leave.cancel}
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary rounded-[5px] bg-green-500 px-6 py-2 font-medium text-white hover:bg-green-600"
              >
                {dict.leave.confirm}
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="grid grid-cols-7 gap-4 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-7 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            {dict.leave.username}
          </h5>
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center px-2 pb-3.5"
          onClick={() => handleSort("type")}
        >
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            {dict.leave.leavetype}
          </h5>
          {sortColumn === "type" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center px-2 pb-3.5"
          onClick={() => handleSort("team")}
        >
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            {dict.leave.branch}
          </h5>
          {sortColumn === "team" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            {dict.leave.leavedate}
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            {dict.leave.leavereason}
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="pl-5 text-sm font-medium uppercase xsm:text-base">
            {dict.leave.image}
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="pl-20 text-sm font-medium uppercase xsm:text-base">
            {dict.leave.actions}
          </h5>
        </div>
      </div>

      {currentData.map((leave, key) => (
        <div
          className="grid grid-cols-7 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-7 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="flex items-center gap-3.5 ">
            <div
              className="h-15 w-15 rounded-md"
              style={{ position: "relative", paddingBottom: "20%" }}
              onClick={() =>
                setSelectedImage(
                  leave.users?.userImg
                    ? `http://image.ocean00.com${leave.users?.userImg}`
                    : "/uploads/user/defaultUser.jpg",
                )
              }
            >
              <Image
                src={
                  leave.users?.userImg
                    ? `http://image.ocean00.com${leave.users?.userImg}`
                    : "/uploads/user/defaultUser.jpg"
                }
                width={50}
                height={50}
                alt="leave"
              />
            </div>
            <div className="flex flex-col">
              <p className="flex font-medium text-dark dark:text-white sm:block">
                {leave.users?.name}
              </p>
              <p className="flex text-sm text-gray-500 sm:block">
                {leave.users?.username}
              </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {leave.type}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {leave.users?.AttendBranch?.team}({leave.users?.AttendBranch?.branch})
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="flex flex-col text-body-sm font-medium text-dark dark:text-dark-6">
              <i>Start:{leave.startDate} </i>
              <i>End:{leave.endDate}</i>
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="relative -mr-2 h-28 flex-1 flex-col overflow-y-auto pl-2 pr-2 transition-opacity duration-500">
              <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                {leave.reason}{" "}
              </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {leave.img ? (
                <>
                  <div
                    className="h-25 w-15 rounded-md pl-5"
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "20%",
                    }}
                    onClick={() =>
                      setSelectedImage(`http://image.ocean00.com${leave.img}`)
                    }
                  >
                    <Image
                      src={
                        leave.img ? `http://image.ocean00.com${leave.img}` : ""
                      }
                      width={50}
                      height={50}
                      alt="leave"
                    />
                  </div>
                </>
              ) : (
                <>No image</>
              )}
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center pl-12">
            {/* Only show buttons if no action has been confirmed */}
            {leave.status == "Pending" ? (
              <>
                {/* Approval Button */}
                <button
                  onClick={() => handleConfirmOpen("Approve", leave.id)}
                  className={`mr-2 rounded-full px-5 py-1 lg:px-10 xl:px-5 ${currentAction === "Approve"
                    ? "bg-green-600"
                    : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                >
                  {dict.leave.approve}
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => handleConfirmOpen("Reject", leave.id)}
                  className={`rounded-full px-5 py-1 lg:px-10 xl:px-5 ${currentAction === "Reject"
                    ? "bg-red-600"
                    : "bg-red-500 hover:bg-red-600"
                    } text-white`}
                >
                  {dict.leave.reject}
                </button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center  px-3 py-1 rounded-full">
                  <span
                    className={`font-bold mr-2 ${leave.status === "Approve" ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {leave.status === "Approve" ? "Approved" : "Rejected"}
                  </span>
                  <button
                    onClick={() => {
                      setDeleteId(leave.id);
                      setCurrentAction("Delete");
                      setIsConfirmOpen(true);
                    }}
                    className="p-1 hover:bg-red-200 rounded-full"
                  >
                    <IconTrash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </>
            )}

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={handleConfirmClose}>
              <div className="p-5 text-center">
                <p className="mb-4 font-bold">
                  {currentAction === "Delete"
                    ? "Are you sure you want to delete this leave request?"
                    : `Are you sure you want to ${currentAction} this leave request?`}
                </p>

                <div className="mt-6 flex items-center justify-end space-x-4">
                  <button
                    onClick={handleConfirmClose}
                    className="font-medium text-red-500 underline hover:text-red-600"
                  >
                    {dict.leave.cancel}
                  </button>

                  <button
                    onClick={() => {
                      if (currentAction === "Delete" && deleteId) {
                        handleDelete(deleteId);
                      } else {
                        handleConfirm();
                      }
                      setIsConfirmOpen(false);
                    }}
                    className="btn btn-primary rounded-[5px] bg-green-500 px-6 py-2 font-medium text-white hover:bg-opacity-90"
                  >
                    {dict.leave.confirm}
                  </button>
                </div>
              </div>
            </Modal>

            {/* Update design based on current action */}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between px-7.5 py-7">
        <div className="flex items-center">
          {/* Jump to First (<<) */}
          {totalPages > MAX_VISIBLE_PAGES && currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(1)}
              className="mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium hover:bg-primary hover:text-white"
            >
              {"<<"}
            </button>
          )}

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white"
          >
            {dict.dashboard.prev}
          </button>

          {/* Page Numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium 
        ${currentPage === page ? "bg-primary text-white" : "hover:bg-primary hover:text-white"}`}
            >
              {page}
            </button>
          ))}

          {/* More button */}


          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white"
          >
            {dict.dashboard.next}
          </button>
          {totalPages > MAX_VISIBLE_PAGES && visiblePages[visiblePages.length - 1] < totalPages && (
            <button
              onClick={() => setCurrentPage(visiblePages[visiblePages.length - 1] + 1)}
              className="mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium hover:bg-primary hover:text-white"
            >
              {">>"}
            </button>
          )}
        </div>
        <p className="font-medium">
          Showing {currentPage} of {totalPages} pages
        </p>
      </div>

      {/* Render the image modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <Image src={selectedImage || ""} width={500} height={500} alt="leave" />
      </Modal>
    </div>
  );
};

export default LeaveTable;
