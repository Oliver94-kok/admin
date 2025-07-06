"use client";
import { useRef, useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Modal from "@/components/modal";
import InputGroup from "@/components/Form/FormElements/InputGroup";
import { AddUser } from "@/action/addUser";
export const dynamic = "force-dynamic";
import { useSession, SessionProvider } from 'next-auth/react';
import { roleAdmin } from "@/lib/function";
import { getDataBranch } from "@/data/branch";
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
  const [branch, setBranch] = useState<{ id: string; code: string, team: string }[] | null>(null);
  const [selectBranch, setSelectBranch] = useState<{ id: string; code: string, team: string }[] | null>(null);
  const [isBranch, setIsBranch] = useState<boolean>(true)
  const [team, setTeam] = useState("")
  const [userBranch, setUserBranch] = useState("")
  const getBranch = async () => {
    let team = await roleAdmin(session.data?.user.role);
    console.log("🚀 ~ getBranch ~ team:", team)
    if (session.data?.user.role == "ADMIN") {
      let data = await getDataBranch("All")
      setBranch(data)
      setSelectBranch(data)
      console.log("🚀 ~ getBranch ~ data:", data)
    } else {
      setIsBranch(false);
      let data = await getDataBranch(team);
      setBranch(data)
      setSelectBranch(data)
      console.log("🚀 ~ getBranch ~ data:", data)
    }
  }
  const handleOpenModal = async () => {
    let n = name.current?.value;
    let role = session.data?.user.role;
    if (!n) return;
    let teams;
    if (role == "ADMIN") {
      teams = team
    } else {
      teams = await roleAdmin(role);
    }
    AddUser(n, teams!, userBranch).then((data) => {
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
    getBranch()
  }, []);

  if (!dict) return <div>Loading...</div>; // Show a loading state until the dictionary is loaded
  const onchangeTeam = (val: any) => {
    setTeam(val.target.value)
    setIsBranch(false);
    let d = branch?.filter((e) => e.team == val.target.value)
    console.log("🚀 ~ onchangeTeam ~ d:", d)
    setSelectBranch(d || [])
  }
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
              {session.data?.user.role == "ADMIN" ? (<><div className="mb-4.5">
                <label htmlFor="TEAM" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select team</label>
                <select
                  id="TEAM"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={onchangeTeam}
                >
                  <option selected>Choose a team</option>
                  <option value={"A"}>A</option>
                  <option value={"B"}>B</option>
                  <option value={"C"}>C</option>
                  <option value={"D"}>D</option>
                  <option value={"E"}>E</option>
                  <option value="SW">SW</option>
                  <option value="Ocean">Ocean</option>
                </select>
              </div></>) : (<></>)}
              <div className="mb-4.5">
                <label htmlFor="branch" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select branch</label>
                <select
                  id="branch"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  disabled={isBranch}
                  onChange={(val) => {
                    setUserBranch(val.target.value)
                  }}
                >
                  <option selected>Choose a branch</option>
                  {selectBranch?.map((b) => (
                    <>
                      <option value={b.code} key={b.id}>{b.code}</option>
                    </>
                  ))}
                </select>
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
