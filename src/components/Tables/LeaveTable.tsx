// src/components/LeaveTable.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Leave } from '@/types/product';
import Modal from '../modal';
import { LeavesInterface } from '@/types/leave';
import { ApproveLeave } from '@/action/approveLeave';
import { SentNoti } from '@/lib/function';
import { DateTime } from 'luxon';
import { mutate } from 'swr';
import { toast, ToastContainer } from "react-toastify";
interface LeaveTableInterface {
  data: LeavesInterface[]
}


const LeaveTable = ({ data }: LeaveTableInterface) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Add sort order state
  const [sortColumn, setSortColumn] = useState<string | null>(null); // Add sort column state
  const itemsPerPage = 10;
  const [dataLeave, setDataLeave] = useState(data);
  const [leaveId, setLeaveId] = useState("");
  useEffect(() => {
    if (data) {
      setDataLeave(data);
    }
  }, [data]);



  // Function to handle sorting
  const handleSort = (column: string) => {
    const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newSortOrder);
  };

  // Sort the filtered data
  const sortedData = [...dataLeave].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof LeavesInterface];
    const bValue = b[sortColumn as keyof LeavesInterface];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    return 0;
  });

  // Paginate the data
  const filteredData = sortedData.filter(attend => {
    // if (attend.name && attend.username && attend.workingHour) {
    const searchText = searchQuery.toLowerCase(); // Lowercase searchQuery once
    return attend.users?.name.toLowerCase().includes(searchText) ||
      attend.users?.username.toLowerCase().includes(searchText)
    //   attend?.workingHour.toString().includes(searchText);
    // }
    // return false; // Explicitly return false to avoid accidental inclusions
  });
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      // Replace this with your actual data-fetching logic
      console.log('Fetching new data...');

      // Simulate a delay or an API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Handle your data (e.g., update state, store response)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleConfirmOpen = (action: string, id: string) => {
    setLeaveId(id)
    setCurrentAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    // Reset current action if needed
    setCurrentAction(null);
  };

  const handleConfirm = async () => {
    ApproveLeave(currentAction!, leaveId).then(async (data) => {
      if (data.error) {
        toast.error(data.error, {
          position: "top-center"
        })
        return;
      }
      if (data.success) {
        let d = await SentNoti("Leave", `Your leave has been ${currentAction}`, data.leaveId, data.username);
        console.log(d)
        mutate("/api/leave/dashboard");
        toast.success("Success add overtime", {
          position: "top-center",
        });
        // window.location.reload();
      }
    })
    console.log(`Action: ${currentAction}, Leave ID: ${leaveId}`);
    handleConfirmClose();
  };

  return (
    <div className="min-w-full rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">


      {/* Search Input */}
      <div className="flex justify-between mb-5">
        <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
          User Leave
        </h4>
        <div className="relative mb-5 w-full max-w-[414px]">
          <input
            className="w-full rounded-[7px] border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
            placeholder="Search here..."
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
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.958 11.957C12.2508 11.6641 12.7257 11.6641 13.0186 11.957L16.2811 15.2195C16.574 15.5124 16.574 15.9872 16.2811 16.2801C15.9882 16.573 15.5133 16.573 15.2205 16.2801L11.958 13.0176C11.6651 12.7247 11.6651 12.2499 11.958 11.957Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-4 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Username</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer px-2 pb-3.5" onClick={() => handleSort('leavetype')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base">Leave Type</h5>
          {sortColumn === 'leavetype' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer px-2 pb-3.5" onClick={() => handleSort('branch')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base">Branch</h5>
          {sortColumn === 'branch' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Leave Date</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Leave Reason</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base pl-5">Image</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center px-2 pb-3.5">
          <h5 className="text-sm font-medium uppercase xsm:text-base pl-20">Actions</h5>
        </div>
      </div>

      {currentData.map((leave, key) => (
        <div
          className="grid grid-cols-8 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="flex items-center gap-3.5 px-2 py-4">
            <div
              className="h-12.5 w-15 rounded-md"
              style={{ position: "relative", paddingBottom: "20%" }}
              onClick={() => setSelectedImage(leave.users?.userImg ? leave.users?.userImg : "/uploads/user/defaultUser.jpg")}
            >
              <Image
                src={leave.users?.userImg ? leave.users?.userImg : "/uploads/user/defaultUser.jpg"}
                width={60}
                height={50}
                alt="leave"
              />
            </div>
            <div className="flex flex-col">
              <p className="flex font-medium text-dark dark:text-white sm:block">
                {leave.users?.name}
              </p>
              <p className="flex text-gray-500 text-sm sm:block">
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
              {leave.users?.AttendBranch?.team}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="flex flex-col text-body-sm font-medium text-dark dark:text-dark-6">
              <i>Start:{leave.startDate} </i>
              <i>End:{leave.endDate}</i>
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="flex-col flex-1 transition-opacity duration-500 relative -mr-2 pr-2 pl-2 h-28 overflow-y-auto">
              <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                {leave.reason} </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {leave.img ? <>
                <div
                  className="h-25 w-15 rounded-md pl-5"
                  style={{ position: "relative", width: "100%", paddingBottom: "20%" }}
                  onClick={() => setSelectedImage(leave.img)}
                >
                  <Image
                    src={leave.img ? leave.img : ""}
                    width={100}
                    height={90}
                    alt="leave"
                  />
                </div></> : <>
                No image

              </>}
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center pl-12">
            {/* Only show buttons if no action has been confirmed */}
            {leave.status == "Pending" ? (
              <>
                {/* Approval Button */}
                <button
                  onClick={() => handleConfirmOpen('Approve', leave.id)}
                  className={`rounded-full px-5 py-1 lg:px-10 xl:px-5 mr-2 ${currentAction === 'Approve' ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                >
                  Approve
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => handleConfirmOpen('Reject', leave.id)}
                  className={`rounded-full px-5 py-1 lg:px-10 xl:px-5 ${currentAction === 'Reject' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <div >

                  <p className={`font-bold ${leave.status === 'Approve' ? 'text-green-600' : 'text-red-600'}`}>
                    This request has been {leave.status === 'Approve' ? 'approved' : 'rejected'}.
                  </p>
                </div>

              </>
            )}

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={handleConfirmClose}>
              <div className="text-center p-5">
                <p className="mb-4">Are you sure you want to {currentAction} this leave request?</p>
                <div className="flex justify-end items-center space-x-4 mt-6">
                  <button
                    onClick={handleConfirmClose}
                    className="text-red-500 underline font-medium hover:text-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleConfirm(); // Call confirm logic
                      setCurrentAction(currentAction); // Update the current action
                    }}
                    className="btn btn-primary bg-green-500 text-white rounded-[5px] px-6 py-2 font-medium hover:bg-opacity-90"
                  >
                    Confirm
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
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium hover:bg-primary hover:text-white ${currentPage === i + 1 ? "bg-primary text-white" : ""
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] hover:bg-primary hover:text-white"
          >
            Next
          </button>
        </div>
        <p className="font-medium">
          Showing {currentPage} of {totalPages} pages
        </p>
      </div>

      {/* Render the image modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <Image
          src={selectedImage || ''}
          width={300}
          height={300}
          alt="leave"
        />
      </Modal>
    </div>
  );
};

export default LeaveTable;
