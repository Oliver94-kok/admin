"use client";
import { useEffect, useState } from "react";
import { BRAND } from "@/types/brand";
import Image from "next/image";
import Modal from "../modal";
import { AttendsInterface } from "@/types/attendents";
import dayjs from "dayjs";
import { getDataByDate } from "@/data/attend";
import { DateTime } from "luxon";

interface dashTableInterface {
  data: AttendsInterface[];
  onDateChange: (date: string) => void;
  currentDate: string;
}

const DashTable = ({ data, onDateChange, currentDate }: dashTableInterface) => {
  const [tableDate, setTableData] = useState(data);
  console.log("🚀 ~ DashTable ~ tableDate:", tableDate);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Add sort order state
  const [sortColumn, setSortColumn] = useState<string | null>(null); // Add sort column state
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const itemsPerPage = 10;
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);
  // Generate the last three days' options including today
  const getLastThreeDays = () => {
    const today = dayjs();
    const dates = [];
    for (let i = 0; i < 3; i++) {
      dates.push(today.subtract(i, "day").format("DD/MM"));
    }
    return dates;
  };

  // Function to handle sorting
  const handleSort = (column: string) => {
    const newSortOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newSortOrder);
  };

  // Sort the filtered data
  const sortedData = [...tableDate].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof AttendsInterface];
    const bValue = b[sortColumn as keyof AttendsInterface];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });
  // Filtering data by search query
  const filteredData = sortedData.filter((attend) => {
    // if (attend.name && attend.username && attend.workingHour) {
    const searchText = searchQuery.toLowerCase(); // Lowercase searchQuery once
    return (
      attend.name.toLowerCase().includes(searchText) ||
      attend.username.toLowerCase().includes(searchText)
    );
    //   attend?.workingHour.toString().includes(searchText);
    // }
    // return false; // Explicitly return false to avoid accidental inclusions
  });
  const onchangeDate = (value: string) => {
    onDateChange(value); // This will trigger SWR refetch in parent
  };
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const displayTime = (clock: any) => {
    const dateTime = DateTime.fromISO(clock);
    return dateTime.toLocaleString(DateTime.TIME_SIMPLE);
  };
  return (
    <div
      className="h-[1280px] w-[1920px] overflow-auto rounded-[10px] bg-white p-4 
           px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card md:h-auto md:w-full md:p-6 2xl:p-10"
    >
      {/* Search Input */}
      <div className="mb-5 flex justify-between">
        <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
          <select
            value={dayjs(currentDate).format("DD/MM")}
            onChange={(e) => onchangeDate(e.target.value)}
            className="rounded bg-white pr-3 text-body-2xlg font-bold uppercase text-dark dark:bg-gray-dark dark:text-white"
          >
            {getLastThreeDays().map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>{" "}
          Clock in User
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
      <div className="flex flex-col">
        <div className="grid grid-cols-6 sm:grid-cols-6">
          <div className="px-2 pb-3.5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Username
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Branch
            </h5>
          </div>
          <div
            className="col-span-1 flex cursor-pointer items-center justify-center px-2 pb-3.5"
            onClick={() => handleSort("clockin")}
          >
            <p className="text-sm font-medium uppercase xsm:text-base">
              Clock-In
            </p>
            {sortColumn === "clockin" && (
              <span
                className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
              >
                {sortOrder === "asc" ? "▲" : "▼"}
              </span>
            )}
          </div>
          <div
            className="col-span-1 flex cursor-pointer items-center justify-center px-2 pb-3.5"
            onClick={() => handleSort("clockout")}
          >
            <p className="text-sm font-medium uppercase xsm:text-base">
              Clock-Out
            </p>
            {sortColumn === "clockout" && (
              <span
                className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
              >
                {sortOrder === "asc" ? "▲" : "▼"}
              </span>
            )}
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Photo
            </h5>
          </div>
          <div className="col-span-1 flex cursor-pointer items-center justify-center px-2 pb-3.5">
            <p className="text-sm font-medium uppercase xsm:text-base">
              Location
            </p>
            {/* {sortColumn === 'location' && (
              <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
                {sortOrder === 'asc' ? '▲' : '▼'}
              </span>
            )} */}
          </div>
        </div>

        {currentData.map((brand, key) => (
          <div
            className={`grid grid-cols-6 sm:grid-cols-6 ${key === currentData.length - 1
              ? ""
              : "border-b border-stroke dark:border-dark-3"
              }`}
            key={key}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="h-15 w-15 rounded-md"
                style={{ position: "relative", paddingBottom: "20%" }}
                onClick={() =>
                  setSelectedImage(
                    brand.userImg
                      ? `https://image.ocean00.com${brand.userImg}`
                      : "/uploads/user/defaultUser.jpg",
                  )
                }
              >
                <Image
                  src={
                    brand.userImg
                      ? `https://image.ocean00.com${brand.userImg}`
                      : "/uploads/user/defaultUser.jpg"
                  }
                  width={50}
                  height={50}
                  alt="leave"
                />
              </div>
              <div className="flex flex-col">
                <p className="flex font-medium text-dark dark:text-white sm:block">
                  {brand.name}
                </p>
                <p className="flex text-sm text-gray-500 sm:block">
                  {brand.username}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="flex flex-col text-body-sm font-medium text-dark dark:text-dark-6">
                <i>{brand.team} </i>
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {/* {brand.clockIn?.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric' })} */}
                {brand.clockIn ? displayTime(brand.clockIn) : "No clock in"}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-green-light-1">
                {/* {brand.clockin?.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric' })} */}
                {brand.clockOut ? displayTime(brand.clockOut) : "No clock out "}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3.5 px-2 py-2 ">
              {brand.img ? (
                <>
                  <div
                    className="h-15 w-15 rounded-md"
                    style={{ position: "relative", paddingBottom: "20%" }}
                    onClick={() => setSelectedImage(`https://image.ocean00.com${brand.img}`)}
                  >
                    <Image
                      src={brand.img ? `https://image.ocean00.com${brand.img}` : "/images/brand/brand-02.svg"}
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

            <div className="flex items-center justify-center px-2 py-4">
              <p className="flex flex-col text-body-sm font-medium text-dark dark:text-dark-6">
                <i>
                  <span className="text-green-500">Clock in:</span>{" "}
                  {brand.locationIn}
                </i>
                <i>
                  <span className="text-orange-500">Clock out:</span>
                  {brand.locationOut}
                </i>
              </p>
            </div>
          </div>
        ))}
        {/* Render the image modal */}
        <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
          <Image
            src={selectedImage || ""}
            width={500}
            height={500}
            alt="leave"
          />
        </Modal>
      </div>

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
    </div>
  );
};

export default DashTable;
