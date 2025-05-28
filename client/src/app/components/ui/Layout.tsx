"use client";

import { usePathname } from "next/navigation";
import { useAppSelector } from "@/app/lib/redux/store";
import Sidebar from "./Sidebar";
import { Spin } from "antd";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const shouldShowSidebar = isAuthenticated && !isPublicRoute;

  if (shouldShowSidebar) {
    return (
      <div className="flex min-h-screen overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    );
  }

  return <div className="w-full overflow-x-hidden">{children}</div>;
}
