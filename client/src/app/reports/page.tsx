"use client";
import React from "react";
import { Row, Col } from "antd";
import { Toaster } from "react-hot-toast";
import { useReports } from "@/app/hooks/useReports";
import CourseEnrollmentReport from "./components/CourseEnrollmentReport";
import TopStudentsReport from "./components/TopStudentsReport";

export default function ReportsPage() {
  const { courses, loading: coursesLoading } = useReports();

  return (
    <div className="p-6 min-h-screen bg-gray-50  mt-6 ">
      <Toaster position="top-right" />
      {coursesLoading ? (
        <p>Loading courses...</p>
      ) : (
        <Row gutter={[0, 32]}>
          <Col span={24}>
            <CourseEnrollmentReport courses={courses} />
          </Col>
          <Col span={24}>
            <TopStudentsReport courses={courses} />
          </Col>
        </Row>
      )}
    </div>
  );
}
