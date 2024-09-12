// src/components/LeaveTable.tsx
"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
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

const LeaveTable = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleConfirmOpen = (action: string) => {
    setCurrentAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
    // Reset current action if needed
    setCurrentAction(null);
  };

  const handleConfirm = () => {
    if (currentAction === 'approve') {
      console.log('Approved');
    } else if (currentAction === 'reject') {
      console.log('Rejected');
    }
    handleConfirmClose();
  };

  return (
    <div className="w-[1280px] rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="px-4 py-6 md:px-6 xl:px-9">
        <h4 className="text-body-2xlg font-bold text-dark dark:text-white">User Leave</h4>
      </div>

      <div className="grid grid-cols-6 gap-4 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Username</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Leave Type</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Leave Date</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Leave Reason</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Image</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Actions</p>
        </div>
      </div>

      {productData.map((product, key) => (
        <div
          className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-dark-3 sm:grid-cols-8 md:px-6 2xl:px-7.5"
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
              MC
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <p className="text-body-sm font-medium text-dark dark:text-dark-6">
              10/9/2025(08:00) <br></br> 13/09/2025(10:00)
            </p>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="flex-col flex-1 transition-opacity duration-500 relative -mr-2 pr-2 h-28 overflow-y-auto">
              <p className="text-body-sm font-medium text-dark dark:text-dark-6">
                123454654564 65465465465 123454654564 65456465465465 123454654564654 5646546546545 646545646
                123454654564 65465465465 123454654564 65456465465465 123454654564654 5646546546545 646545646
                123454654564 65465465465 123454654564 65456465465465 123454654564654 5646546546545 646545646
                123454654564 65465465465 123454654564 65456465465465 123454654564654 5646546546545 646545646
                123454654564 65465465465 123454654564 65456465465465 123454654564654 5646546546545 646545646
              </p>
            </div>
          </div>
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
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <button
              onClick={() => handleConfirmOpen('Approve')}
              className="bg-green-500 text-white rounded-full px-5 py-1 lg:px-10 xl:px-5 mr-2 hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleConfirmOpen('Reject')}
              className="bg-red-500 text-white rounded-full px-5 py-1 lg:px-10 xl:px-5 hover:bg-red-600"
            >
              Reject
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

      {/* Render the confirmation modal */}
      <Modal isOpen={isConfirmOpen} onClose={handleConfirmClose}>
        <div className="text-center p-5 ">
          <p className="mb-4">Are you sure you want to {currentAction} this leave request?</p>
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

export default LeaveTable;
