import React, { useState } from "react";

const LanguageForm = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
    // Handle language change logic here (e.g., update app's language or submit form)
  };

  return (
    <>
      <li className="hidden lg:block">
        <form action="https://formbold.com/s/unique_form_id" method="POST">
          <div className="relative w-full max-w-[300px]">
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full rounded-full border border-stroke bg-gray-2 py-3 pl-5 pr-5 text-dark focus:border-primary focus:outline-none dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus:border-primary xl:w-[300px]"
            >
              <option value="en">English</option>
              <option value="ms">Malay</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </form>
      </li>
    </>
  );
};

export default LanguageForm;
