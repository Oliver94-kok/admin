// src/components/SalaryTable.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "../modal";
import Link from "next/link";
import { SalaryUser } from "@/types/salary";
import { addPerDay } from "@/action/addperDay";
import { AddOverTime, delOvetime } from "@/action/salaryOt";
import BonusPopup from "../Form/bonuspopup";
import AllowPopup from "../Form/allowpopup";
import CoverPopup from "../Form/coverpopup";
import { AddAllow, delAllow } from "@/action/salaryAllow";
import { AddBonus, delBonus } from "@/action/salaryBonus";
import { AddCover, delCover } from "@/action/salaryCover";
import OTPopup from "../Form/otpopup";
import { ComponentSalary } from "../Form/componentSalary";
import { useSalaryStore } from "@/lib/zudstand/salary";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { toast, ToastContainer } from "react-toastify";

export type SelectedItem = {
  id: string; // Assuming 'id' is a string, ensure it's the same in the selectedItems type.
  item: string; // 'item' should also be a string.
  idSalary: string;
};

interface SalaryTableInterface {
  data: SalaryUser[];
  refresh?: () => void;
  onMonthChange: (month: string) => void;
  currentMonth: string,
  onYearChange: (year: string) => void;
  currentYear: string;
}

export enum typeComponentSalary {
  OverTime,
  Bonus,
  Allowance,
  Cover,
}

const SalaryTable = ({ data, onMonthChange, currentMonth, currentYear, onYearChange }: SalaryTableInterface) => {
  const router = useRouter();
  const [dataSalary, setDataSalary] = useState<SalaryUser[]>(data);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Add sort order state
  const [sortColumn, setSortColumn] = useState<string | null>(null); // Add sort column state
  const itemsPerPage = 10;
  const [id, setid] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [idSalary, setIdSalary] = useState<string>("");
  const [selectAll, setSelectAll] = useState(false); // State for Select All
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const {
    salaryUsers,
    addSalaryUser,
    addSalaryUsers,
    filterAndRemoveSalaryUsers,
    clearSalaryUsers,
    saveSalaryUsersToStorage,
  } = useSalaryStore();

  useEffect(() => {
    if (data) {
      setDataSalary(data)
    }
  }, [data])
  // Handle Select All Logic
  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      let checkperday: (string | undefined)[] = [];
      currentData.forEach((d) => {
        if (d.perDay == null) {
          checkperday.push(d.users?.name);
        }
      });

      const allSelectedItems = currentData.map((salary) => ({
        id: salary.id, // Ensure to provide the correct id
        item: salary.users?.name || "", // Adjust based on your data structure
        idSalary: salary.id, // Adjust based on your data structure
      }));
      setSelectedItems(allSelectedItems);
      if (checkperday.length != 0) {
        checkperday.forEach((e) => {
          alert(`${e} not have input per day salary`);
        });
        // return;
      }
      const newUser: SalaryUser[] = dataSalary;
      console.log("🚀 ~ handleSelectAllChange ~ newUser:", newUser)

      addSalaryUsers(newUser);
      console.log(selectedItems.length);
    } else {
      clearSalaryUsers();
      setSelectedItems([]);
    }
  };

  // Function to handle printing of selected entries
  const handlePrint = () => {
    if (salaryUsers.length == 0) {
      alert("No items selected for printing.");
      return;
    }
    saveSalaryUsersToStorage();
    router.push("/invoice");
    console.log("Printing selected items:", salaryUsers);
  };

  // Function to handle sorting
  const handleSort = (column: string) => {
    const newSortOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newSortOrder);
  };

  // Sort the filtered data
  const sortedData = [...dataSalary].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn as keyof SalaryUser] as unknown as number;
    const bValue = b[sortColumn as keyof SalaryUser] as unknown as number;

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate the data
  const filteredData = sortedData.filter(
    (salary) =>
      salary.users?.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      salary.users?.name.toString().includes(searchQuery) ||
      salary.total!.toString().includes(searchQuery),
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleConfirmOpen = (id: string) => {
    setIdSalary(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    setError("");
    // Reset current action if needed
  };

  const handleConfirm = async () => {
    console.log("salary handle confirm", salary);
    if (!salary || Number(salary) === 0) {
      setError("Cannot confirm with an empty or zero value.");
      return;
    }
    setError("");
    let result = await addPerDay(idSalary, Number(salary));
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.success) {
      setDataSalary((prevUsers) =>
        prevUsers.map((user) =>
          user.id === idSalary
            ? {
              ...user,
              ...{ perDay: Number(salary), total: Number(result.total) },
            }
            : user,
        ),
      );
      mutate("/api/salary/dashboard");
      handleConfirmClose();
      // window.location.reload();
    }
  };

  const handleOpenForm = (popupType: string, id: string, salaryId: string) => {
    console.log("🚀 ~ handleOpenForm ~ salaryId:", salaryId);
    setid(id);
    setIdSalary(salaryId);
    setActivePopup(popupType); // Set the type of popup to open
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setActivePopup(null);
  };

  const handleAddComponentSalary = async (
    item: string,
    id: string,
    type: typeComponentSalary,
  ) => {
    switch (type) {
      case typeComponentSalary.OverTime:
        AddOverTime(id, Number(item)).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? {
                    ...user,
                    ...{ overTime: Number(item), total: data.total },
                  }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success add overtime", {
              position: "top-center",
            });
            console.info(data.success);
            return;
          }
        });
        break;
      case typeComponentSalary.Allowance:
        AddAllow(id, Number(item)).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? {
                    ...user,
                    ...{ allowance: Number(item), total: data.total },
                  }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success add allowance", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      case typeComponentSalary.Bonus:
        AddBonus(id, Number(item)).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? { ...user, ...{ bonus: Number(item), total: data.total } }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success add bonus ", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      case typeComponentSalary.Cover:
        AddCover(id, Number(item)).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? { ...user, ...{ cover: Number(item), total: data.total } }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success add cover", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      default:
        break;
    }

    handleCloseForm(); // Close the form after adding
  };

  const handleRemoveComponentSalary = async (
    id: string,
    type: typeComponentSalary,
  ) => {
    const isConfirmed = window.confirm("Are you sure you want to remove this salary component?");

    // If the user cancels the action, exit the function
    if (!isConfirmed) {
      return;
    }

    console.log("🚀 ~ handleRemoveComponentSalary ~ id:", id);
    switch (type) {
      case typeComponentSalary.OverTime:
        delOvetime(id).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? { ...user, ...{ overTime: null, total: data.total } }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success remove overtime", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      case typeComponentSalary.Allowance:
        delAllow(id).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? { ...user, ...{ allowance: null, total: data.total } }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success remove allowance", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      case typeComponentSalary.Bonus:
        delBonus(id).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? { ...user, ...{ bonus: null, total: data.total } }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success remove bonus", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      case typeComponentSalary.Cover:
        delCover(id).then((data) => {
          if (data.error) {
            console.error(data.error);
            toast.error(data.error, {
              position: "top-center"
            })
            return;
          }
          if (data.success) {
            setDataSalary((prevUsers) =>
              prevUsers.map((user) =>
                user.id === id
                  ? { ...user, ...{ cover: null, total: data.total } }
                  : user,
              ),
            );
            mutate("/api/salary/dashboard");
            toast.success("Success remove cover", {
              position: "top-center",
            });
            return;
          }
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-[1920px] h-[1280px] p-4 md:p-6 2xl:p-10 overflow-auto 
           md:w-full md:h-auto rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-5 flex justify-between">
        <div className="relative mb-5">
          {/* Year selection dropdown */}
          <select
            id="year"
            className="rounded bg-white p-2 pr-5 text-[24px] font-bold text-dark dark:bg-gray-dark dark:text-white"
            value={currentYear}
            onChange={(e) => onYearChange(e.target.value)}
          >
            {/* Add year options */}
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
          </select>

          {/* Month selection dropdown with Check button beside it */}
          <select
            id="month"
            className="ml-5 mr-5 rounded bg-white p-2 text-[24px] font-bold uppercase text-dark dark:border-gray-600 dark:bg-gray-dark dark:text-white"
            // defaultValue={String(new Date().getMonth() + 1).padStart(2, '0')}  // Set default to current month
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
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

          {/* Check button beside the month dropdown */}
          <button className="ml-5 rounded bg-blue-500 px-4 py-2 pl-5 pr-5 font-bold text-white hover:bg-blue-600">
            Check
          </button>
        </div>

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

      <div className="grid grid-cols-12 gap-4 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-12 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Username
          </h5>
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center"
          onClick={() => handleSort("bday")}
        >
          <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
            Basic Salary<br></br>(Day)
          </h5>
          {sortColumn === "bday" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center"
          onClick={() => handleSort("ot")}
        >
          <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
            OT<br></br>(Hours)
          </h5>
          {sortColumn === "ot" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center"
          onClick={() => handleSort("totalday")}
        >
          <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
            Total Working Days
          </h5>
          {sortColumn === "totalday" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center"
          onClick={() => handleSort("late")}
        >
          <h5 className="text-sm font-medium uppercase xsm:text-base">Late</h5>
          {sortColumn === "late" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">OT</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Bonus</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Allowance
          </h5>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Cover</h5>
        </div>
        <div
          className="col-span-1 flex cursor-pointer items-center justify-center"
          onClick={() => handleSort("totalsal")}
        >
          <h5 className="text-center text-sm font-medium uppercase xsm:text-base">
            Total salary
          </h5>
          {sortColumn === "totalsal" && (
            <span
              className={`ml-2 ${sortOrder === "asc" ? "text-primary" : "text-secondary"}`}
            >
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center">
          <button
            onClick={handlePrint}
            className="text-sm font-medium uppercase hover:text-blue-600 xsm:text-base"
          >
            Print
          </button>
          <label className="mt-2 flex items-center">
            <input
              type="checkbox"
              checked={selectAll} // Bind checkbox to selectAll state
              onChange={handleSelectAllChange} // Handle change
              className="mr-2"
            />
            <span className="text-sm">Select all</span>
          </label>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">
            Actions
          </h5>
        </div>
      </div>

      {currentData.map((salary, key) => (
        <div
          className={`grid grid-cols-12 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-12 md:px-6 2xl:px-7.5 ${key === currentData.length - 1
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
                  salary.users?.userImg
                    ? `http://localhost:3001${salary.users?.userImg}`
                    : "/uploads/user/defaultUser.jpg",
                )
              }
            >
              <Image
                src={
                  salary.users?.userImg
                    ? `http://localhost:3001${salary.users?.userImg}`
                    : "/uploads/user/defaultUser.jpg"
                }
                width={50}
                height={50}
                alt="leave"
              />
            </div>
            <div className="flex flex-col">
              <p className="flex font-medium text-dark dark:text-white sm:block">
                {salary.users?.name}
              </p>
              <p className="flex text-sm text-gray-500 sm:block">
                {salary.users?.username}
              </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.perDay}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.overTimeHour}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.workingDay}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-red-500 dark:text-red-300">
              {salary?.fine! + salary?.fine2!}
            </p>
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center">
            {/* ButtonPopup component */}
            <button
              className="mb-4 rounded-full border border-primary text-primary px-4 sm:px-6 md:px-8 lg:px-10 xl:px-5"
              onClick={() => handleOpenForm("OT", id, salary.id)}
            >
              Add{" "}
            </button>

            {/* MultiSelect component */}
            <div className="items-center justify-center px-5">
              {/* <MultiSelect
                items={selectedItems}
                onRemove={handleRemoveOverTime}
                id={id}
              /> */}
              {salary.overTime && (
                <>
                  <ComponentSalary
                    amount={salary.overTime}
                    type={typeComponentSalary.OverTime}
                    id={salary.id}
                    handleRemove={handleRemoveComponentSalary}
                  />
                </>
              )}
            </div>
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center">
            {/* ButtonPopup component */}

            <button
              className="mb-4 rounded-full border border-primary text-primary px-4 sm:px-6 md:px-8 lg:px-10 xl:px-5"
              onClick={() => handleOpenForm("Bonus", id, salary.id)}
            >
              Add{" "}
            </button>

            {/* MultiSelect component */}
            <div className="items-center justify-center px-5">
              {salary.bonus && (
                <>
                  <ComponentSalary
                    amount={salary.bonus}
                    type={typeComponentSalary.Bonus}
                    id={salary.id}
                    handleRemove={handleRemoveComponentSalary}
                  />
                </>
              )}
            </div>
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center">
            {/* ButtonPopup component */}
            <button
              className="mb-4 rounded-full border border-primary text-primary px-4 sm:px-6 md:px-8 lg:px-10 xl:px-5"
              onClick={() => handleOpenForm("Allow", id, salary.id)}
            >
              Add{" "}
            </button>
            {/* MultiSelect component */}
            <div className="items-center justify-center px-5">
              {salary.allowance && (
                <>
                  {" "}
                  <ComponentSalary
                    amount={salary.allowance.toString()}
                    type={typeComponentSalary.Allowance}
                    id={salary.id}
                    handleRemove={handleRemoveComponentSalary}
                  />{" "}
                </>
              )}
            </div>
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center">
            {/* ButtonPopup component */}
            <button
              className="mb-4 rounded-full border border-primary text-primary px-4 sm:px-6 md:px-8 lg:px-10 xl:px-5"
              onClick={() => handleOpenForm("Cover", id, salary.id)}
            >
              Add{" "}
            </button>

            {/* MultiSelect component */}
            <div className="items-center justify-center px-5">
              {salary.cover && (
                <>
                  {" "}
                  <ComponentSalary
                    amount={salary.cover}
                    type={typeComponentSalary.Cover}
                    id={salary.id}
                    handleRemove={handleRemoveComponentSalary}
                  />{" "}
                </>
              )}
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.total}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.some((item) => item.id === salary.id)} // Check if item is selected
                onChange={() => {
                  const itemExists = selectedItems.some(
                    (item) => item.id === salary.id,
                  );
                  if (itemExists) {
                    filterAndRemoveSalaryUsers({ id: salary.id });
                    setSelectedItems((prev) =>
                      prev.filter((item) => item.id !== salary.id),
                    );
                  } else {
                    addSalaryUser(salary);
                    setSelectedItems((prev) => [
                      ...prev,
                      {
                        id: salary.id,
                        item: salary.users?.name || "",
                        idSalary: salary.id,
                      },
                    ]);
                  }
                }}
                className="mr-2"
              />
            </label>
          </div>

          <div className="col-span-1 flex items-center justify-center space-x-3.5">
            <button
              onClick={() => handleConfirmOpen(salary.id)}
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
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
              </svg>
            </button>
            {/* <Link
              href={`/invoice/${salary.id}`} // Update to your desired route
              className="flex items-center justify-center hover:text-primary"
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
              </svg>
            </Link> */}
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
          src={selectedImage || ""}
          width={500}
          height={500}
          alt="Product"
        />
      </Modal>

      {/* Combined Popups */}
      {isFormOpen && (
        <>
          {activePopup === "OT" && (
            <OTPopup
              isOpen={true}
              onClose={handleCloseForm}
              onAddItem={handleAddComponentSalary} // Use the specific handler
              id={idSalary}
              items={selectedItems}
              type={typeComponentSalary.OverTime}
            />
          )}
          {activePopup === "Bonus" && (
            <BonusPopup
              isOpen={true}
              onClose={handleCloseForm}
              onAddItem={handleAddComponentSalary} // Use the specific handler
              id={idSalary}
              items={selectedItems}
              type={typeComponentSalary.Bonus}
            />
          )}
          {activePopup === "Allow" && (
            <AllowPopup
              isOpen={true}
              onClose={handleCloseForm}
              onAddItem={handleAddComponentSalary} // Use the specific handler
              id={idSalary}
              items={selectedItems}
              type={typeComponentSalary.Allowance}
            />
          )}
          {activePopup === "Cover" && (
            <CoverPopup
              isOpen={true}
              onClose={handleCloseForm}
              onAddItem={handleAddComponentSalary} // Use the specific handler
              id={idSalary}
              items={selectedItems}
              type={typeComponentSalary.Cover}
            />
          )}
        </>
      )}

      {/* Render the confirmation modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => {
          handleConfirmClose();
          setSalary(""); // Clear the salary input
          setError("");  // Clear any error messages
        }}
      >
        <div className="p-5">
          <p className="mb-4 justify-center text-center">
            Are you sure you want to change this Basic Salary (Day)?
          </p>

          {/* Text field for entering the salary */}
          <div className="flex justify-center">
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Enter new Basic Salary (Day)"
              className="mb-4 w-full max-w-xs rounded-lg border border-gray-300 p-2 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Error message */}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Buttons positioned at the bottom right */}
          <div className="mt-6 flex items-center justify-end space-x-4">
            <button
              onClick={() => {
                handleConfirmClose();
                setSalary(""); // Clear the salary input
                setError("");  // Clear any error messages
              }}
              className="font-medium text-red-500 underline hover:text-red-600"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleConfirm();
                setSalary(""); // Clear the salary input after confirming
                setError("");  // Clear any error messages
              }}
              className="btn btn-primary rounded-[5px] bg-green-500 px-6 py-2 font-medium text-white hover:bg-opacity-90"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalaryTable;
