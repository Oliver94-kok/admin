"use client";

import { BranchsUser } from "@/types/branchs";
import React, { useState } from "react";
import Image from "next/image";
import BranchSelectGroup from "../Form/FormElements/MultiSelect/branchselect";
import ClockinSelectGroup from "../Form/FormElements/MultiSelect/clockinselect";
import ClockoutSelectGroup from "../Form/FormElements/MultiSelect/clockoutselect";
import DatePickerOne from "../Form/FormElements/DatePicker/DatePickerOne";

import Flatpickr from "react-flatpickr";
import Modal from "../modal";
import { UpdateUserBranch } from "@/action/attendBranch";
import { resetPasswordUser } from "@/action/resetpassword";
import { deleteUsers } from "@/action/deleteUser";
interface BranchTableAInterfface {
  data: BranchsUser[];
  team: string;
}

export enum typeData {
  BRANCH,
  CLOCKIN,
  CLOCKOUT,
  STARTON,
  OFFDAY,
}

export const BranchATable = ({ data, team }: BranchTableAInterfface) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectBranch, setSelectBranch] = useState<string | null>();
  const [clockIn, setClockIn] = useState<string>();
  const [clockOut, setClockOut] = useState<string>();
  const [offDay, setOffDay] = useState<string>();
  const [startOn, setStartOn] = useState<string>();
  const [idBranch, setIdBranch] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userTeam, setUserTeam] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const itemsPerPage = 10;

  // Paginate the data
  const filteredData = data.filter((teamA) =>
    teamA.users?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const fetchData = async () => {
    try {
      // Replace this with your actual data-fetching logic
      console.log("Fetching new data...");

      // Simulate a delay or an API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Handle your data (e.g., update state, store response)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const onSendData = (type: typeData, data: string) => {
    switch (type) {
      case typeData.BRANCH:
        setSelectBranch(data);
        break;
      case typeData.CLOCKIN:
        setClockIn(data);
        break;
      case typeData.CLOCKOUT:
        setClockOut(data);
        break;
      case typeData.OFFDAY:
        console.log("onsend off", data);
        setOffDay(data);
        break;
      case typeData.STARTON:
        console.log("onsend off", data);
        setStartOn(data);
        break;
      default:
        break;
    }
  };

  const submit = async () => {
    if (!startOn) {
      setErrorMsg("Please enter start on");
      return;
    }

    UpdateUserBranch(
      idBranch,
      selectBranch,
      clockIn,
      clockOut,
      offDay,
      startOn,
    ).then((data) => {
      if (data.error) {
        console.error(data.error);
        setErrorMsg("has error");
        return;
      }
      if (data.success) {
        console.log(data.success);
        setIsConfirmOpen(false);
        fetchData();
        window.location.reload();
      }
    });
  };

  const resetPassword = async () => {
    resetPasswordUser(username).then((data) => {
      console.log("🚀 ~ resetPasswordUser ~ data:", data);
      if (data?.error) {
        setErrorMsg(data.error);
        return;
      }
      if (data.success) {
        setPassword(data.success);
      }
    });
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const handleDelete = async () => {
    deleteUsers(username).then((data) => {
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }
      if (data.success) {
        setIsDeleteOpen(false);
        fetchData();
        window.location.reload();
      }
    });
  };
  return (
    <>
      <div className="mb-5 flex justify-between">
        <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
          {team}
        </h4>
        <div className="relative z-20 mb-5 w-full max-w-[414px]">
          {/* <input
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
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-8 gap-4 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Username
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Branches
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
            Clock-In<br></br> Time
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
            Clock-Out Time
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Start On
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Off Day
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base"></h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Actions
          </h5>
        </div>
      </div>

      {currentData.map((teamA, key) => (
        <div
          className={`grid grid-cols-8 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5 ${
            key === currentData.length - 1
              ? ""
              : "border-b border-stroke dark:border-dark-3"
          }`}
          key={key}
        >
          <div className="flex items-center gap-3.5 px-2 py-4">
            <div
              className="h-12.5 w-15 rounded-md"
              style={{ position: "relative", paddingBottom: "20%" }}
              onClick={() =>
                setSelectedImage(
                  teamA.users?.userImg
                    ? teamA.users?.userImg
                    : "/uploads/user/defaultUser.jpg",
                )
              }
            >
              <Image
                src={
                  teamA.users?.userImg
                    ? teamA.users?.userImg
                    : "/uploads/user/defaultUser.jpg"
                }
                width={60}
                height={50}
                alt="leave"
              />
            </div>
            <div className="flex flex-col">
              <p className="flex font-medium text-dark dark:text-white sm:block">
                {teamA.users?.name}
              </p>
              <p className="flex text-sm text-gray-500 sm:block">
                {teamA.users?.username}
              </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              <BranchSelectGroup
                onSendData={onSendData}
                initialValue={teamA.team}
              />
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              <ClockinSelectGroup
                onSendData={onSendData}
                initialValue={teamA.clockIn ? teamA.clockIn : "00:00"}
              />
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              <ClockoutSelectGroup
                onSendData={onSendData}
                initialValue={teamA.clockOut ? teamA.clockOut : "00:00"}
              />
            </p>
          </div>

          <div className="col-span-1 flex items-center justify-center px-2">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              <Flatpickr
                placeholder="dd/mm/yyyy"
                render={({ defaultValue, value, ...props }, ref) => {
                  return (
                    <DatePickerOne
                      defaultValue={
                        teamA.startOn ? teamA.startOn : defaultValue
                      }
                      inputRef={ref}
                      value={undefined}
                    />
                  );
                }}
                options={{
                  mode: "single",
                  static: true,
                  monthSelectorType: "static",
                  dateFormat: "d/m/Y",
                  parseDate: (datestr, format) => {
                    return new Date(datestr.split("/").reverse().join("-"));
                  },
                  minDate: "today",
                  prevArrow:
                    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
                  nextArrow:
                    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
                }}
                onChange={([date]) => {
                  console.log(
                    "🚀 ~ BranchATable ~ date:",
                    date.toLocaleDateString(),
                  );
                  let tarikh = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                  console.log("🚀 ~ BranchATable ~ tarikh:start", tarikh);
                  onSendData(typeData.STARTON, tarikh);
                }}
                // value={clockIn}
              />
            </p>
          </div>

          <div className="col-span-1 flex items-center justify-center px-2">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              <Flatpickr
                placeholder="dd/mm/yyyy"
                render={({ defaultValue, value, ...props }, ref) => {
                  return (
                    <DatePickerOne
                      defaultValue={teamA.offDay ? teamA.offDay : defaultValue}
                      inputRef={ref}
                      value={undefined}
                    />
                  );
                }}
                options={{
                  mode: "single",
                  static: true,
                  monthSelectorType: "static",
                  dateFormat: "d/m/Y",
                  parseDate: (datestr, format) => {
                    return new Date(datestr.split("/").reverse().join("-"));
                  },
                  minDate: "today",
                  prevArrow:
                    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
                  nextArrow:
                    '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
                }}
                onChange={([date]) => {
                  console.log(
                    "🚀 ~ BranchATable ~ date:",
                    date.toLocaleDateString(),
                  );
                  let tarikh = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                  console.log("🚀 ~ BranchATable ~ tarikh:start", tarikh);
                  onSendData(typeData.OFFDAY, tarikh);
                }}
                // value={clockIn}
              />
            </p>
          </div>

          <div className="col-span-1 flex items-center justify-center">
            <button
              onClick={() => {
                setIdBranch(teamA.id);
                setName(teamA.users?.name!);
                setUserTeam(teamA.team);
                setIsConfirmOpen(true);
              }}
              className="rounded-full border border-primary px-5  py-1 text-primary lg:px-10 xl:px-5"
            >
              Confirm
            </button>
          </div>
          <div className="col-span-1 flex items-center justify-center space-x-3.5">
            <button
              onClick={() => {
                setIdBranch(teamA.id);
                setName(teamA.users?.name!);
                setUsername(teamA.users?.username!);
                setUserTeam(teamA.team);
                setIsResetOpen(true);
              }}
              className="hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill=""
                  d="M10 1C7.79 1 6 2.79 6 5V7H5C3.9 7 3 7.9 3 9V16C3 17.1 3.9 18 5 18H15C16.1 18 17 17.1 17 16V9C17 7.9 16.1 7 15 7H14V5C14 2.79 12.21 1 10 1ZM10 3C11.1 3 12 3.9 12 5V7H8V5C8 3.9 8.9 3 10 3ZM5 9H15V16H5V9ZM10 11C9.45 11 9 11.45 9 12V14C9 14.55 9.45 15 10 15C10.55 15 11 14.55 11 14V12C11 11.45 10.55 11 10 11Z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.5 5.5L13.4 6.4C12.53 7.27 11.84 8.26 11.5 9.5H13C13.13 8.69 13.47 7.94 14.05 7.36L14.94 8.25L15 6H13.5L12.5 5.5Z"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setIdBranch(teamA.id);
                setName(teamA.users?.name!);
                setUsername(teamA.users?.username!);
                setUserTeam(teamA.team);
                setIsDeleteOpen(true);
              }}
              className="hover:text-primary"
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.59048 1.87502H11.4084C11.5887 1.8749 11.7458 1.8748 11.8941 1.89849C12.4802 1.99208 12.9874 2.35762 13.2615 2.88403C13.3309 3.01727 13.3805 3.16634 13.4374 3.33745L13.5304 3.61654C13.5461 3.66378 13.5506 3.67715 13.5545 3.68768C13.7004 4.09111 14.0787 4.36383 14.5076 4.3747C14.5189 4.37498 14.5327 4.37503 14.5828 4.37503H17.0828C17.4279 4.37503 17.7078 4.65485 17.7078 5.00003C17.7078 5.34521 17.4279 5.62503 17.0828 5.62503H2.91602C2.57084 5.62503 2.29102 5.34521 2.29102 5.00003C2.29102 4.65485 2.57084 4.37503 2.91602 4.37503H5.41609C5.46612 4.37503 5.47993 4.37498 5.49121 4.3747C5.92009 4.36383 6.29844 4.09113 6.44437 3.6877C6.44821 3.67709 6.45262 3.66401 6.46844 3.61654L6.56145 3.33747C6.61836 3.16637 6.66795 3.01728 6.73734 2.88403C7.01146 2.35762 7.51862 1.99208 8.1047 1.89849C8.25305 1.8748 8.41016 1.8749 8.59048 1.87502ZM7.50614 4.37503C7.54907 4.29085 7.5871 4.20337 7.61983 4.1129C7.62977 4.08543 7.63951 4.05619 7.65203 4.01861L7.7352 3.7691C7.81118 3.54118 7.82867 3.49469 7.84602 3.46137C7.9374 3.2859 8.10645 3.16405 8.30181 3.13285C8.33892 3.12693 8.38854 3.12503 8.6288 3.12503H11.37C11.6103 3.12503 11.6599 3.12693 11.697 3.13285C11.8924 3.16405 12.0614 3.2859 12.1528 3.46137C12.1702 3.49469 12.1877 3.54117 12.2636 3.7691L12.3468 4.01846L12.379 4.11292C12.4117 4.20338 12.4498 4.29085 12.4927 4.37503H7.50614Z"
                  fill=""
                />
                <path
                  d="M4.92859 7.04179C4.90563 6.69738 4.60781 6.43679 4.2634 6.45975C3.91899 6.48271 3.6584 6.78053 3.68136 7.12494L4.06757 12.9181C4.13881 13.987 4.19636 14.8505 4.33134 15.528C4.47167 16.2324 4.71036 16.8208 5.20335 17.2821C5.69635 17.7433 6.2993 17.9423 7.01151 18.0355C7.69653 18.1251 8.56189 18.125 9.63318 18.125H10.3656C11.4369 18.125 12.3023 18.1251 12.9873 18.0355C13.6995 17.9423 14.3025 17.7433 14.7955 17.2821C15.2885 16.8208 15.5272 16.2324 15.6675 15.528C15.8025 14.8505 15.86 13.987 15.9313 12.9181L16.3175 7.12494C16.3404 6.78053 16.0798 6.48271 15.7354 6.45975C15.391 6.43679 15.0932 6.69738 15.0702 7.04179L14.687 12.7911C14.6121 13.9143 14.5587 14.6958 14.4416 15.2838C14.328 15.8542 14.1693 16.1561 13.9415 16.3692C13.7137 16.5824 13.4019 16.7206 12.8252 16.796C12.2307 16.8738 11.4474 16.875 10.3217 16.875H9.67718C8.55148 16.875 7.76814 16.8738 7.17364 16.796C6.59697 16.7206 6.28518 16.5824 6.05733 16.3692C5.82949 16.1561 5.67088 15.8542 5.55725 15.2838C5.44011 14.6958 5.38675 13.9143 5.31187 12.7911L4.92859 7.04179Z"
                  fill=""
                />
                <path
                  d="M7.8539 8.5448C8.19737 8.51045 8.50364 8.76104 8.53799 9.10451L8.95466 13.2712C8.989 13.6146 8.73841 13.9209 8.39495 13.9553C8.05148 13.9896 7.74521 13.739 7.71086 13.3956L7.29419 9.22889C7.25985 8.88542 7.51044 8.57915 7.8539 8.5448Z"
                  fill=""
                />
                <path
                  d="M12.1449 8.5448C12.4884 8.57915 12.739 8.88542 12.7047 9.22889L12.288 13.3956C12.2536 13.739 11.9474 13.9896 11.6039 13.9553C11.2604 13.9209 11.0098 13.6146 11.0442 13.2712L11.4609 9.10451C11.4952 8.76104 11.8015 8.51045 12.1449 8.5448Z"
                  fill=""
                />
              </svg>
            </button>
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
              className={`mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium hover:bg-primary hover:text-white ${
                currentPage === i + 1 ? "bg-primary text-white" : ""
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
          src={selectedImage || ""}
          width={600}
          height={500}
          alt="Product"
        />
      </Modal>

      {/* Render the confirmation modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => {
          setErrorMsg("");
          setIsConfirmOpen(false);
        }}
      >
        <div className="p-5">
          <p className="mb-4 justify-center text-center">
            {!errorMsg && (
              <>
                Are you sure want to change this {name} from team {userTeam}?
              </>
            )}
            {errorMsg && <p className="text-red-600">{errorMsg}</p>}
          </p>

          {/* Buttons positioned at the bottom right */}
          <div className="mt-6 flex items-center justify-end space-x-4">
            <button
              onClick={() => {
                setErrorMsg("");
                setIsConfirmOpen(false);
              }}
              className="font-medium text-red-500 underline hover:text-red-600"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="btn btn-primary rounded-[5px] bg-green-500 px-6 py-2 font-medium text-white hover:bg-opacity-90"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isResetOpen}
        onClose={() => {
          setIsResetOpen(false);
          setErrorMsg("");
          setPassword("");
        }}
      >
        <div className="p-5">
          {!password ? (
            <>
              <p className="mb-4 justify-center text-center">
                {!errorMsg && (
                  <> Are you sure want to Reset this {name} Password?</>
                )}
                {errorMsg && <p className="text-red-600">{errorMsg}</p>}
              </p>
            </>
          ) : (
            <>
              <div>
                <h4 className="mb-4 text-lg font-semibold">Credentials</h4>
                <div className="mb-4">
                  <p className="font-medium">Username:</p>
                  <p className="text-gray-800">{username}</p>
                </div>
                <div className="mb-4">
                  <p className="font-medium">Password:</p>
                  <p className="text-gray-800">{password}</p>
                </div>
              </div>
            </>
          )}

          {/* Buttons positioned at the bottom right */}
          <div className="mt-6 flex items-center justify-end space-x-4">
            <button
              onClick={() => {
                setIsResetOpen(false);
                setErrorMsg("");
                setPassword("");
              }}
              className="font-medium text-red-500 underline hover:text-red-600"
            >
              {password ? "Close" : "Cancel"}
            </button>
            {password && (
              <>
                {" "}
                <button
                  className="mt-1 text-blue-500 underline"
                  onClick={() =>
                    handleCopy(
                      "Username:" + username + "  " + "Password:" + password,
                    )
                  }
                >
                  Copy
                </button>
              </>
            )}
            {!password && (
              <>
                {" "}
                <button
                  onClick={() => resetPassword()}
                  className="btn btn-primary rounded-[5px] bg-green-500 px-6 py-2 font-medium text-white hover:bg-opacity-90"
                >
                  Confirm
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <div className="p-5">
          <p className="mb-4 justify-center text-center">
            {!errorMsg && ` Are you sure want to Delete this ${name}?`}
            {errorMsg && <p className="text-red-600">{errorMsg}</p>}
          </p>

          {/* Buttons positioned at the bottom right */}
          <div className="mt-6 flex items-center justify-end space-x-4">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="font-medium text-black underline hover:text-black"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete()}
              className="btn btn-primary rounded-[5px] bg-red-600 px-6 py-2 font-medium text-white hover:bg-opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
