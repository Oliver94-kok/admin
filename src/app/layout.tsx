
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import OneSignal from "react-onesignal";
import { ReactQueryClientProvider } from "@/components/QueryClientProvider ";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { SessionProvider } from 'next-auth/react';
import { auth } from "../../auth";
import ClientWrapper from "@/components/clientWrapper";

import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body suppressHydrationWarning={true}>
          <ClientWrapper>{children}</ClientWrapper>
        </body>
      </html>
    </SessionProvider>
  );
}

