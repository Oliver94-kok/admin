"use client"
import { useRef, useState } from 'react';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Modal from "@/components/modal";
import InputGroup from '@/components/Form/FormElements/InputGroup';
import { AddUser } from '@/action/addUser';

const FormLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const name = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")
  const handleOpenModal = async () => {

    let n = name.current?.value
    if (!n) return

    AddUser(n).then((data) => {
      if (data) {
        setUsername(data.username);
        setPassword(data.password)
      }
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Dummy username and password
  // const username = "user123";
  // const password = "pass1234";

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
              {/* <InputGroup
                label="Name"
                type="text"
                placeholder="Enter full name"
                customClasses="mb-4.5"
                name='userName'
                ref={name}
              /> */}
              <div className='mb-4.5'>
                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Name
                  <span className="text-red">*</span>
                </label>
                <input
                  type={"text"}
                  placeholder='Enter full name'
                  name='username'
                  ref={name}
                  className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
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

