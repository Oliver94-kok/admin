// src/components/SalaryTable.tsx
"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Salary } from '@/types/product';
import ButtonPopup from '../Buttons/plusButton'; // Adjust the path as needed
import PopupForm from '../Form/PopupForm'; // Adjust the path as needed
import MultiSelect from '../Form/MultiSelect'; // Adjust the path as needed
import Modal from '../modal';

const salaryData: Salary[] = [
  {
    image: "/images/product/product-03.png",
    name: "tester",
    username: "001",
    bday: 70,
    bmonth: 296,
    totalday: 22,
    late: -50,
    totalsal: 45,
  },
  {
    image: "/images/product/product-03.png",
    name: "tester",
    username: "003",
    bday: 90,
    bmonth: 600,
    totalday: 10,
    late: -100,
    totalsal: 500,
  },
  {
    image: "/images/product/product-03.png",
    name: "tester",
    username: "002",
    bday: 2220,
    bmonth: 600,
    totalday: 80,
    late: -40,
    totalsal: 600,
  },
  {
    image: "/images/product/product-03.png",
    name: "tester",
    username: "001",
    bday: 70,
    bmonth: 296,
    totalday: 22,
    late: -50,
    totalsal: 45,
  },
  {
    image: "/images/product/product-03.png",
    name: "tester",
    username: "003",
    bday: 500,
    bmonth: 200,
    totalday: 10,
    late: -100,
    totalsal: 500,
  },
  {
    image: "/images/product/product-03.png",
    name: "tester",
    username: "002",
    bday: 2220,
    bmonth: 600,
    totalday: 80,
    late: -40,
    totalsal: 600,
  },
  // ... other products
];

const SalaryTable = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Add sort order state
  const [sortColumn, setSortColumn] = useState<string | null>(null); // Add sort column state
  const itemsPerPage = 10;





  // Function to handle sorting
  const handleSort = (column: string) => {
    const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newSortOrder);
  };

  // Sort the filtered data
  const sortedData = [...salaryData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn as keyof Salary] as unknown as number;
    const bValue = b[sortColumn as keyof Salary] as unknown as number;

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate the data
  const filteredData = sortedData.filter(salary =>
    salary.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salary.bday.toString().includes(searchQuery) ||
    salary.bmonth.toString().includes(searchQuery) ||
    salary.totalday.toString().includes(searchQuery) ||
    salary.late.toString().includes(searchQuery) ||
    salary.totalsal.toString().includes(searchQuery)
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleConfirmOpen = () => {

    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    // Reset current action if needed

  };

  const handleConfirm = () => {
    handleConfirmClose();
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleAddItem = (item: string) => {
    setSelectedItems((prevItems) => [...prevItems, item]);
    handleCloseForm(); // Close the form after adding
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems((prevItems) => prevItems.filter(i => i !== item));
  };

  return (
    <div className="w-[1280px] rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex justify-between mb-5">
        <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
          User Salary
        </h4>
        <div className="relative mb-5 z-20 w-full max-w-[414px]">
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
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Username</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer" onClick={() => handleSort('bday')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base text-center">Basic Salary<br></br>(Day)</h5>
          {sortColumn === 'bday' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer" onClick={() => handleSort('bmonth')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base text-center">Basic Salary<br></br>(Month)</h5>
          {sortColumn === 'bmonth' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer" onClick={() => handleSort('totalday')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base text-center">Total Working Days</h5>
          {sortColumn === 'totalday' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer" onClick={() => handleSort('late')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base">Late</h5>
          {sortColumn === 'late' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">OT</h5>
        </div>
        <div className="col-span-1 flex items-center justify-center cursor-pointer" onClick={() => handleSort('totalsal')}>
          <h5 className="text-sm font-medium uppercase xsm:text-base">Total salary</h5>
          {sortColumn === 'totalsal' && (
            <span className={`ml-2 ${sortOrder === 'asc' ? 'text-primary' : 'text-secondary'}`}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
        </div>
      </div>

      {currentData.map((salary, key) => (
        <div
          className={`grid grid-cols-8 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5 ${key === currentData.length - 1 ? "" : "border-b border-stroke dark:border-dark-3"
            }`} key={key}
        >
          <div className="flex items-center gap-3.5 px-2 py-4">
            <div
              className="h-12.5 w-15 rounded-md"
              style={{ position: "relative", paddingBottom: "20%" }}
              onClick={() => setSelectedImage(salary.image)}
            >
              <Image
                src={salary.image}
                width={60}
                height={50}
                alt="leave"
              />
            </div>
            <div className="flex flex-col">
              <p className="flex font-medium text-dark dark:text-white sm:block">
                {salary.name}
              </p>
              <p className="flex text-gray-500 text-sm sm:block">
                {salary.username}
              </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.bday}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.bmonth}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.totalday}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-red-500 dark:text-red-300">
              {salary.late}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="px-4 py-6">
              <MultiSelect
                items={selectedItems}
                onRemove={handleRemoveItem}
              />
            </div>
            <ButtonPopup
              onClick={handleOpenForm}
              customClasses="border border-primary text-primary rounded-full rounded-[2px] px-5 py-1 lg:px-10 xl:px-5"
            />
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              {salary.totalsal}
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center space-x-3.5">
            <button
              onClick={handleConfirmOpen}
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
            <button className="hover:text-primary">
              <a
                href="/path/to/your/file.pdf" // Replace with your PDF file path
                download
                className="flex items-center justify-center"
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
              </a>
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
          width={600}
          height={500}
          alt="Product"
        />
      </Modal>

      {/* Render the popup form modal */}
      <PopupForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onAddItem={handleAddItem}
      />

      {/* Render the confirmation modal */}
      <Modal isOpen={isConfirmOpen} onClose={handleConfirmClose}>
        <div className="p-5">
          <p className="mb-4 text-center justify-center">
            Are you sure you want to change this Basic Salary?
          </p>

          {/* Add a text field here */}
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Enter new Basic Salary"
              className="mb-4 w-full max-w-xs rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Buttons positioned at the bottom right */}
          <div className="flex justify-end items-center space-x-4 mt-6">
            <button
              onClick={handleConfirmClose}
              className="text-red-500 underline font-medium hover:text-red-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary bg-green-500 text-white rounded-[5px] px-6 py-2 font-medium hover:bg-opacity-90"
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
