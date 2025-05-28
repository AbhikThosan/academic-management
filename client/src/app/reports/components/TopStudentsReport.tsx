import React from "react";
import { Card, Form, Select, InputNumber, Button, Table } from "antd";
import { useReports } from "@/app/hooks/useReports";
import type { Course } from "@/app/hooks/useReports";

interface TopStudentsReportProps {
  courses: Course[];
}

export default function TopStudentsReport({ courses }: TopStudentsReportProps) {
  const {
    topStudentsReport,
    handleTopStudentsFilter,
    exportTopStudentsReport,
    loading,
  } = useReports();
  const [form] = Form.useForm();

  const handleFinish = (values: { courseId?: string; limit: number }) => {
    handleTopStudentsFilter(values);
  };

  const handleReset = () => {
    form.resetFields();
    handleTopStudentsFilter({ limit: 5 });
  };

  const columns = [
    {
      title: "Student ID",
      dataIndex: "id",
      key: "id",
      className: "text-sm sm:text-base",
      render: (id: string) => id.slice(-4),
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      className: "text-sm sm:text-base",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      className: "text-sm sm:text-base",
    },
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
      className: "text-sm sm:text-base",
      render: (courseId: string) => courseId || "N/A",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      className: "text-sm sm:text-base",
      render: (courseName: string) => courseName || "N/A",
    },
  ];

  return (
    <Card
      className="rounded-2xl shadow-sm"
      bodyStyle={{ padding: 32 }}
      style={{ borderRadius: 20 }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-6">
        Top Students Report
      </h2>
      <Form
        form={form}
        layout="inline"
        onFinish={handleFinish}
        className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4"
        initialValues={{ limit: 5 }}
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
          name="limit"
          label={<span className="text-sm sm:text-base">Limit</span>}
          rules={[{ required: true, message: "Please enter a limit" }]}
          className="w-full sm:w-auto"
        >
          <InputNumber
            min={1}
            max={50}
            className="w-full sm:w-[100px] text-sm sm:text-base"
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
            onClick={exportTopStudentsReport}
            disabled={loading || !topStudentsReport.length}
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
          dataSource={topStudentsReport}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="text-sm sm:text-base"
        />
      </div>
    </Card>
  );
}
