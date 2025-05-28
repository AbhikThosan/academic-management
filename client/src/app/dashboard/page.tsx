"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/lib/redux/store";
import { Spin, Alert } from "antd";
import SummaryCards from "./components/SummaryCards";
import CourseEnrollmentsChart from "./components/CourseEnrollmentChart";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import TopStudents from "./components/TopStudents";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );
  const { summaryData, courseEnrollments, topStudents, loading, error } =
    useDashboardData();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 mt-6">
        <Alert
          message="Error"
          description="Failed to load dashboard data. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 mt-6">
      <div className="space-y-4 sm:space-y-6">
        <SummaryCards summaryData={summaryData} />
        <CourseEnrollmentsChart courseEnrollments={courseEnrollments} />
        <div className="mt-6">
          <TopStudents topStudents={topStudents} />
        </div>
      </div>
    </div>
  );
}
