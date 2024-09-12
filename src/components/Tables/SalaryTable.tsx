// src/components/SalaryTable.tsx
"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import ButtonPopup from '../Buttons/plusButton'; // Adjust the path as needed
import PopupForm from '../Form/PopupForm'; // Adjust the path as needed
import MultiSelect from '../Form/MultiSelect'; // Adjust the path as needed
import Modal from '../modal';

const productData: Product[] = [
  {
    image: "/images/product/product-03.png",
    name: "001",
    category: "Electronics",
    price: 296,
    sold: 22,
    active: 45,
    confirm: 45,
  },
  // ... other products
];

const SalaryTable = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
    <div className="w-[1280px] rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="px-4 py-6 md:px-6 xl:px-9">
        <h4 className="text-body-2xlg font-bold text-dark dark:text-white">User Salary</h4>
      </div>

      <div className="grid grid-cols-8 gap-4 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Username</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Basic Salary<br></br>(Day)</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Basic Salary<br></br>(Month)</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Total Working Days</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Late</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">OT</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Total salary</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Actions</p>
        </div>
      </div>

      {productData.map((product, key) => (
        <div
          className="grid grid-cols-8 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="col-span-1 flex items-center justify-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className="h-12.5 w-15 rounded-md"
                style={{ position: "relative", width: "100%", paddingBottom: "20%" }}
                onClick={() => setSelectedImage(product.image)}
              >
                <Image
                  src={product.image}
                  width={60}
                  height={50}
                  alt="Product"
                />
              </div>
              <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                {product.name}
              </p>
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              70
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              280
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              4
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-red-500 dark:text-red-300">
              - 100
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
              180
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
