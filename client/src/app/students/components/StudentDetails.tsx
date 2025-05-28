"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, Descriptions, Button, Row, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useStudent } from "@/app/hooks/useStudent";

interface StudentDetailsProps {
  studentId: string;
}

export default function StudentDetails({ studentId }: StudentDetailsProps) {
  const router = useRouter();
  const { student, loading, error } = useStudent(studentId);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !student) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-800">
          {error ? `Error: ${error.message}` : "Student not found"}
        </h2>
        <Button
          type="primary"
          onClick={() => router.back()}
          icon={<ArrowLeftOutlined />}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        onClick={() => router.back()}
        icon={<ArrowLeftOutlined />}
        className="mb-4"
      >
        Back to Students
      </Button>

      <Card>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            {student.name}
          </h1>
          <p className="text-gray-500">
            GPA:{" "}
            <span className={student.gpaColor}>{student.gpa.toFixed(2)}</span>
          </p>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Academic Information" type="inner">
              <Descriptions column={2}>
                <Descriptions.Item label="Year">
                  {student.year}
                </Descriptions.Item>
                <Descriptions.Item label="Courses">
                  {student.courses}
                </Descriptions.Item>
                <Descriptions.Item label="GPA">
                  <span className={student.gpaColor}>
                    {student.gpa.toFixed(2)}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Grades" type="inner">
              <Descriptions column={2}>
                {student.grades.map((grade) => (
                  <Descriptions.Item
                    key={grade.courseName}
                    label={grade.courseName}
                  >
                    {grade.grade}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
