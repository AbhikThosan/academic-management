import React from "react";
import { Card, Form, Select, Button } from "antd";
import type { Course, Student } from "@/app/lib/hooks/useFacultyForms";

interface AssignStudentToCourseFormProps {
  courses: Course[];
  students: Student[];
  onSubmit: (values: { course: string; student: string }) => void;
}

export default function AssignStudentToCourseForm({
  courses,
  students,
  onSubmit,
}: AssignStudentToCourseFormProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: { course: string; student: string }) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Card
      className="rounded-2xl shadow-sm"
      bodyStyle={{ padding: 32 }}
      style={{ borderRadius: 20 }}
    >
      <h2 className="text-xl font-semibold mb-6">Assign Students to Course</h2>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
        onFinish={handleFinish}
        colon={false}
      >
        <Form.Item
          label="Course:"
          name="course"
          rules={[{ required: true, message: "Please select a course" }]}
        >
          <Select placeholder="Select course">
            {courses.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Student:"
          name="student"
          rules={[{ required: true, message: "Please select a student" }]}
        >
          <Select placeholder="Select student">
            {students.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
          <Button type="primary" htmlType="submit" size="large">
            Assign
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
