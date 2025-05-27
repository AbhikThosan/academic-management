"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/lib/redux/store";
import { Col, Row, Spin, Alert } from "antd";
import SummaryCards from "./components/SummaryCards";
import CourseEnrollmentsChart from "./components/CourseEnrollmentChart";
import { useDashboardData } from "@/app/lib/hooks/useDashboardData";
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
      <div className="p-6 min-h-screen bg-gray-50 mt-6">
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
    <div className="p-6 min-h-screen bg-gray-50 mt-6">
      <SummaryCards summaryData={summaryData} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <CourseEnrollmentsChart courseEnrollments={courseEnrollments} />
        </Col>
        <Col xs={24} md={8}>
          <TopStudents topStudents={topStudents} />
        </Col>
      </Row>
    </div>
  );
}
