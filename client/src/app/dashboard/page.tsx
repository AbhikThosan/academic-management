"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/lib/redux/store";
import { Breadcrumb } from "antd";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 min-h-screen">
      <Breadcrumb
        items={[
          {
            title: "Dashboard",
          },
        ]}
        className="mb-4"
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Welcome, {user?.email || "User"}
        </h2>
        <p className="text-gray-600">Role: {user?.role || "N/A"}</p>
      </div>
    </div>
  );
}
