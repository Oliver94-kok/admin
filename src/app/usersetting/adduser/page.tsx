"use client";
import { useRef, useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Modal from "@/components/modal";
import InputGroup from "@/components/Form/FormElements/InputGroup";
import { AddUser } from "@/action/addUser";
export const dynamic = "force-dynamic";
import { useSession, SessionProvider } from 'next-auth/react';
export const dynamicParams = true;
// Correctly set revalidate value
// export const revalidate = 1;
const dictionaries = {
  en: () => import('../../../locales/en/lang.json').then((module) => module.default),
  zh: () => import('../../../locales/zh/lang.json').then((module) => module.default),
};
const FormLayout = () => {
  const session = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const name = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleOpenModal = async () => {
    let n = name.current?.value;
    let role = session.data?.user.role;
    if (!n) return;

    AddUser(n, role).then((data) => {
      if (data) {
        setUsername(data.username);
        setPassword(data.password);
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
  const [dict, setDict] = useState<any>(null); // State to hold the dictionary

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

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
            <h3 className="font-semibold text-dark dark:text-white">
              {dict.signup.signform}
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
              <div className="mb-4.5">
                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  {dict.signup.name}
                  <span className="text-red">*</span>
                </label>
                <input
                  type={"text"}
                  placeholder={dict.signup.entername}
                  name={dict.branches.username}
                  ref={name}
                  className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
              <button
                type="button"
                className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                onClick={handleOpenModal}
              >
                {dict.signup.adduser}
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
