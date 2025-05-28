"use client";
import React from "react";
import { Drawer, Form, Input, Select, Button } from "antd";
import { useStudentMutations } from "@/app/hooks/useStudentMutations";
import toast from "react-hot-toast";

const { Option } = Select;

interface AddStudentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  year: number;
}

export default function AddStudentDrawer({
  open,
  onClose,
  onSuccess,
}: AddStudentDrawerProps) {
  const [form] = Form.useForm<FormValues>();
  const { addStudent, loading } = useStudentMutations();

  const handleSubmit = async (values: FormValues) => {
    try {
      await addStudent({
        name: values.name,
        year: values.year,
      });
      form.resetFields();
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to add student");
    }
  };

  return (
    <Drawer
      title="Add New Student"
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
              Add Student
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
