"use client";

import { usePathname } from "next/navigation";
import { useAppSelector } from "@/app/lib/redux/store";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const shouldShowSidebar = isAuthenticated && !isPublicRoute;

  if (shouldShowSidebar) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return <div className="w-full">{children}</div>;
}
