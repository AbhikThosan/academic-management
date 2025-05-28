import React from "react";
import { Card, Form, Select, InputNumber, Button } from "antd";
import type { Course, Student } from "@/app/lib/hooks/useFacultyForms";

interface AssignGradesFormProps {
  courses: Course[];
  students: Student[];
  onSubmit: (values: {
    course: string;
    student: string;
    grade: number;
  }) => void;
}

export default function AssignGradesForm({
  courses,
  students,
  onSubmit,
}: AssignGradesFormProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: {
    course: string;
    student: string;
    grade: number;
  }) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Card
      className="rounded-2xl shadow-sm"
      bodyStyle={{ padding: 32 }}
      style={{ borderRadius: 20 }}
    >
      <h2 className="text-xl font-semibold mb-6">Assign Grades</h2>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
        onFinish={handleFinish}
        colon={false}
      >
        <Form.Item
          label="Select Course:"
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
          label="Select Student:"
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
        <Form.Item
          label="Enter Grade:"
          name="grade"
          rules={[
            { required: true, message: "Please enter a grade" },
            {
              type: "number",
              min: 0,
              max: 4,
              message: "Grade must be between 0 and 4",
            },
          ]}
        >
          <InputNumber placeholder="3.75" step={0.25} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
          <Button type="primary" htmlType="submit" size="large">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
