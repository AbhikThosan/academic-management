import React, { useEffect } from "react";
import { Drawer, Form, Input, Select, Button, Typography } from "antd";
import { Faculty } from "@/app/hooks/useCourses";

interface CourseDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    faculty: string | undefined;
    id?: string;
  }) => void;
  faculties: Faculty[];
  mode?: "add" | "edit";
  initialValues?: { name: string; faculty: string | undefined; id?: string };
}

export default function CourseDrawer({
  open,
  onClose,
  onSubmit,
  faculties,
  mode = "add",
  initialValues,
}: CourseDrawerProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleFinish = (values: { name: string; faculty?: string }) => {
    if (mode === "edit" && initialValues?.id) {
      onSubmit({
        name: values.name,
        faculty: values.faculty,
        id: initialValues.id,
      });
    } else {
      onSubmit({ name: values.name, faculty: values.faculty });
    }
    form.resetFields();
  };

  return (
    <Drawer
      title={
        <Typography.Title level={4} className="mb-0">
          {mode === "edit" ? "Edit Course" : "Add Course"}
        </Typography.Title>
      }
      open={open}
      onClose={onClose}
      width={400}
      destroyOnClose
      footer={null}
      bodyStyle={{ padding: 28 }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label={<span className="font-medium">Course Name</span>}
          name="name"
          rules={[{ required: true, message: "Please enter course name" }]}
        >
          <Input placeholder="Enter course name" size="large" />
        </Form.Item>
        <Form.Item
          label={<span className="font-medium">Faculty</span>}
          name="faculty"
        >
          <Select placeholder="Select faculty" size="large" allowClear>
            {faculties.map((f) => (
              <Select.Option key={f.id} value={f.id}>
                {f.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className="mt-8">
          <Button type="primary" htmlType="submit" block size="large">
            {mode === "edit" ? "Update Course" : "Add Course"}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
