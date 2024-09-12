"use client"
import { useState } from 'react';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Modal from "@/components/modal";
import InputGroup from '@/components/Form/FormElements/InputGroup';

const FormLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Dummy username and password
  const username = "user123";
  const password = "pass1234";

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
            <h3 className="font-semibold text-dark dark:text-white">
              Sign Up Form
            </h3>
          </div>
          <form action="#">
            <div className="p-6.5">
              <InputGroup
                label="Name"
                type="text"
                placeholder="Enter full name"
                customClasses="mb-4.5"
              />
              <button
                type="button"
                className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                onClick={handleOpenModal}
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        username={username}
        password={password}
      />
    </DefaultLayout>
  );
};

export default FormLayout;

