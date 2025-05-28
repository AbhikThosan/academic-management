import React from "react";
import { Card, Form, Select, InputNumber, Button, Table } from "antd";
import { useReports } from "@/app/lib/hooks/useReports";
import type { Course } from "@/app/lib/hooks/useReports";

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

  const columns = [
    {
      title: "Student ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
    },
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
      render: (courseId: string) => courseId || "N/A",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      render: (courseName: string) => courseName || "N/A",
    },
  ];

  return (
    <Card
      className="rounded-2xl shadow-sm"
      bodyStyle={{ padding: 32 }}
      style={{ borderRadius: 20 }}
    >
      <h2 className="text-xl font-semibold mb-6">Top Students Report</h2>
      <Form
        form={form}
        layout="inline"
        onFinish={handleFinish}
        className="mb-6"
        initialValues={{ limit: 5 }}
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
        <Form.Item
          name="limit"
          label="Limit"
          rules={[{ required: true, message: "Please enter a limit" }]}
        >
          <InputNumber min={1} max={50} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={loading}>
            Generate Report
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={exportTopStudentsReport}
            disabled={loading || !topStudentsReport.length}
          >
            Export CSV
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={columns}
        dataSource={topStudentsReport}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}
