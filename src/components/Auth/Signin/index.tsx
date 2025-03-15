"use client";
import Link from "next/link";
import React from "react";
import SigninWithPassword from "../SigninWithPassword";
import Image from "next/image";

export default function Signin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-dark rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src={"/images/logo/icon.png"}
            alt="Logo"
            width={176}
            height={32}
          />
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center">
          <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
        </div>

        {/* Sign In with Password */}
        <div>
          <SigninWithPassword />
        </div>
      </div>
    </div>
  );
}
