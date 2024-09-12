import { BRAND } from "@/types/brand";
import Image from "next/image";

const brandData: BRAND[] = [
  {
    logo: "/images/brand/brand-01.svg",
    name: "Google",
    username: "001",
    checkin: "08:00",
    checkout: "16:00",
    inphoto: 590,
    conversion: 4.8,
  },
  {
    logo: "/images/brand/brand-02.svg",
    name: "X.com",
    username: "001",
    checkin: "08:00",
    checkout: "16:00",
    inphoto: 590,
    conversion: 4.8,
  },
  {
    logo: "/images/brand/brand-03.svg",
    name: "Google",
    username: "001",
    checkin: "08:00",
    checkout: "16:00",
    inphoto: 590,
    conversion: 4.8,
  },
  {
    logo: "/images/brand/brand-04.svg",
    name: "Google",
    username: "Vimeo",
    checkin: "08:00",
    checkout: "16:00",
    inphoto: 590,
    conversion: 4.8,
  },
  {
    logo: "/images/brand/brand-05.svg",
    name: "Google",
    username: "Facebook",
    checkin: "08:00",
    checkout: "16:00",
    inphoto: 590,
    conversion: 4.8,
  },
];

const TableOne = () => {
  return (
    <div className="w-[1280px] rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Today Clock in User
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-5 sm:grid-cols-5">
          <div className="px-2 pb-3.5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Username
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Clock-in
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Clock-out
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center ">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Photo
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center ">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Conversion
            </h5>
          </div>
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-5 sm:grid-cols-5 ${key === brandData.length - 1
              ? ""
              : "border-b border-stroke dark:border-dark-3"
              }`}
            key={key}
          >
            <div className="flex items-center gap-3.5 px-2 py-4">
              <div className="flex-shrink-0">
                <Image src={brand.logo} alt="Brand" width={48} height={48} />
              </div>
              <div className="flex flex-col">
                <p className="flex font-medium text-dark dark:text-white sm:block">
                  {brand.name}
                </p>
                <p className="flex text-gray-500 text-sm sm:block">
                  {brand.username}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {brand.checkin}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-green-light-1">
                {brand.checkout}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4 ">
              <p className="font-medium text-dark dark:text-white">
                {brand.inphoto}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {brand.conversion}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
