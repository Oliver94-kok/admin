"use client";
import Image from "next/image";
import { Branch } from "@/types/product";
import React, { useState } from "react";
import Modal from "../modal";
import BranchSelectGroup from "../Form/FormElements/MultiSelect/branchselect";
import ClockinSelectGroup from "../Form/FormElements/MultiSelect/clockinselect";
import ClockoutSelectGroup from "../Form/FormElements/MultiSelect/clockoutselect";
import DatePickerOne from "../Form/FormElements/DatePicker/DatePickerOne";
import { BranchsUser } from "@/types/branchs";
import { BranchATable } from "./BranchATable";

const branchData: Branch[] = [
  {
    image: "/images/product/product-01.png",
    username: "001",
    name: "tester",
    branches: "Electronics",
    setclockin: "08:00",
    setclockout: "16:00",
    starton: "Sep 2, 2024",
  },
  {
    image: "/images/product/product-01.png",
    username: "006",
    name: "test",
    branches: "Electronics",
    setclockin: "08:00",
    setclockout: "16:00",
    starton: "Sep 2, 2024",
  },
  {
    image: "/images/product/product-01.png",
    username: "005",
    name: "tes",
    branches: "Electronics",
    setclockin: "08:00",
    setclockout: "16:00",
    starton: "Sep 2, 2024",
  },
  {
    image: "/images/product/product-01.png",
    username: "004",
    name: "tester",
    branches: "Electronics",
    setclockin: "08:00",
    setclockout: "16:00",
    starton: "Sep 2, 2024",
  },
  {
    image: "/images/product/product-01.png",
    username: "002",
    name: "tester",
    branches: "Electronics",
    setclockin: "08:00",
    setclockout: "16:00",
    starton: "Sep 2, 2024",
  },
];

interface BranchTableInterface {
  A: BranchsUser[];
  B: BranchsUser[];
  C: BranchsUser[];
}

const BranchTable = ({ A, B, C }: BranchTableInterface) => {
  return (
    <div className="w-[1280px] rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <BranchATable data={A} team={"Team A"} />
      <BranchATable data={B} team="Team B" />
      <BranchATable data={C} team="Team C" />
    </div>
  );
};

export default BranchTable;
