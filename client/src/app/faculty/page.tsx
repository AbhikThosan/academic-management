"use client";
import React from "react";
import { Row, Col, Spin } from "antd";
import { useFacultyForms } from "@/app/hooks/useFacultyForms";
import AssignGradesForm from "./components/AssignGradesForm";
import AssignStudentToCourseForm from "./components/AssignStudentToCourseForm";
import { Toaster } from "react-hot-toast";

export default function FacultyPage() {
  const { courses, students, handleAssignGrade, handleAssignStudent, loading } =
    useFacultyForms();

  return (
    <div className="p-6 min-h-screen bg-gray-50 mt-6">
      <Toaster position="top-right" />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[0, 32]}>
          <Col span={24}>
            <AssignGradesForm
              courses={courses}
              students={students}
              onSubmit={handleAssignGrade}
            />
          </Col>
          <Col span={24}>
            <AssignStudentToCourseForm
              courses={courses}
              students={students}
              onSubmit={handleAssignStudent}
            />
          </Col>
        </Row>
      )}
    </div>
  );
}
