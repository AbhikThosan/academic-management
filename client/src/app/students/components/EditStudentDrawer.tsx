"use client";
import React, { useEffect } from "react";
import { Drawer, Form, Input, Select, Button } from "antd";
import { useStudentMutations } from "@/app/hooks/useStudentMutations";
import toast from "react-hot-toast";

const { Option } = Select;

interface EditStudentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: {
    id: string;
    name: string;
    year: number;
  } | null;
}

export default function EditStudentDrawer({
  open,
  onClose,
  onSuccess,
  student,
}: EditStudentDrawerProps) {
  const [form] = Form.useForm();
  const { updateStudent, loading } = useStudentMutations();

  useEffect(() => {
    if (student) {
      form.setFieldsValue({
        name: student.name,
        year: student.year,
      });
    }
  }, [student, form]);

  const handleSubmit = async (values: { name: string; year: number }) => {
    if (!student) return;
    try {
      await updateStudent({
        id: student.id,
        name: values.name,
        year: values.year,
      });
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update student");
    }
  };

  return (
    <Drawer
      title="Edit Student"
      placement="right"
      onClose={onClose}
      open={open}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4"
      >
        <Form.Item
          name="name"
          label="Student Name"
          rules={[{ required: true, message: "Please enter student name" }]}
        >
          <Input placeholder="Enter student name" />
        </Form.Item>

        <Form.Item
          name="year"
          label="Year"
          rules={[{ required: true, message: "Please select year" }]}
        >
          <Select placeholder="Select year">
            <Option value={1}>1st Year</Option>
            <Option value={2}>2nd Year</Option>
            <Option value={3}>3rd Year</Option>
            <Option value={4}>4th Year</Option>
          </Select>
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Student
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
