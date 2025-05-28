import React from "react";
import { Card, Form, Select, DatePicker, Button, Table } from "antd";
import { useReports } from "@/app/hooks/useReports";
import type { Course } from "@/app/hooks/useReports";
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

  const handleReset = () => {
    form.resetFields();
    handleEnrollmentFilter({});
  };

  const columns = [
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
      className: "text-sm sm:text-base",
      render: (courseId: string) => courseId.slice(-4),
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      className: "text-sm sm:text-base",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      className: "text-sm sm:text-base",
      render: (date: string) => format(new Date(date), "yyyy-MM-dd"),
    },
    {
      title: "Enrollment Count",
      dataIndex: "enrollmentCount",
      key: "enrollmentCount",
      className: "text-sm sm:text-base",
    },
  ];

  return (
    <Card
      className="rounded-2xl shadow-sm"
      bodyStyle={{ padding: 32 }}
      style={{ borderRadius: 20 }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-6">
        Course Enrollment Report
      </h2>
      <Form
        form={form}
        layout="inline"
        onFinish={handleFinish}
        className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4"
      >
        <Form.Item
          name="courseId"
          label={<span className="text-sm sm:text-base">Course</span>}
          className="w-full sm:w-auto"
        >
          <Select
            placeholder="Select course"
            className="w-full sm:w-[200px] text-sm sm:text-base"
            allowClear
          >
            {courses.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="dateRange"
          label={<span className="text-sm sm:text-base">Date Range</span>}
          className="w-full sm:w-auto"
        >
          <RangePicker
            format="YYYY-MM-DD"
            className="w-full sm:w-auto text-sm sm:text-base"
          />
        </Form.Item>
        <Form.Item className="w-full sm:w-auto">
          <Button
            type="primary"
            htmlType="submit"
            disabled={loading}
            className="text-sm sm:text-base"
          >
            Generate Report
          </Button>
        </Form.Item>
        <Form.Item className="w-full sm:w-auto">
          <Button
            onClick={exportEnrollmentReport}
            disabled={loading || !enrollmentReport.length}
            className="text-sm sm:text-base"
          >
            Export CSV
          </Button>
        </Form.Item>
        <Form.Item className="w-full sm:w-auto">
          <Button onClick={handleReset} className="text-sm sm:text-base">
            Reset
          </Button>
        </Form.Item>
      </Form>
      <div className="mt-6">
        <Table
          columns={columns}
          dataSource={enrollmentReport}
          rowKey="date"
          loading={loading}
          className="text-sm sm:text-base"
        />
      </div>
    </Card>
  );
}
