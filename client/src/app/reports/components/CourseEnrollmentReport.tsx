import React from "react";
import { Card, Form, Select, DatePicker, Button, Table } from "antd";
import { useReports } from "@/app/lib/hooks/useReports";
import type { Course } from "@/app/lib/hooks/useReports";
import { format } from "date-fns";

const { RangePicker } = DatePicker;

interface CourseEnrollmentReportProps {
  courses: Course[];
}

export default function CourseEnrollmentReport({
  courses,
}: CourseEnrollmentReportProps) {
  const {
    enrollmentReport,
    handleEnrollmentFilter,
    exportEnrollmentReport,
    loading,
  } = useReports();
  const [form] = Form.useForm();

  const handleFinish = (values: {
    courseId?: string;
    dateRange?: [Date, Date];
  }) => {
    handleEnrollmentFilter(values);
  };

  const columns = [
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => format(new Date(date), "yyyy-MM-dd"),
    },
    {
      title: "Enrollment Count",
      dataIndex: "enrollmentCount",
      key: "enrollmentCount",
    },
  ];

  return (
    <Card
      className="rounded-2xl shadow-sm"
      bodyStyle={{ padding: 32 }}
      style={{ borderRadius: 20 }}
    >
      <h2 className="text-xl font-semibold mb-6">Course Enrollment Report</h2>
      <Form
        form={form}
        layout="inline"
        onFinish={handleFinish}
        className="mb-6"
      >
        <Form.Item name="courseId" label="Course">
          <Select placeholder="Select course" style={{ width: 200 }} allowClear>
            {courses.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="Date Range">
          <RangePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={loading}>
            Generate Report
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={exportEnrollmentReport}
            disabled={loading || !enrollmentReport.length}
          >
            Export CSV
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={columns}
        dataSource={enrollmentReport}
        rowKey="date"
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}
