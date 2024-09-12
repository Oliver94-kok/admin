import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import DashTable from "@/components/Tables/DashTable";
import Signin from "@/components/Auth/Signin";

export const metadata: Metadata = {
  title:
    "Dashboard Page",
  description: "Dashboard Page",
};

export default function Home() {
  return (
    <Signin />
  );
}
