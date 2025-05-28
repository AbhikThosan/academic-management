import React from "react";
import { Input, Select, Button, Card, Typography, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Faculty } from "@/app/hooks/useCourses";

interface CourseFilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  faculty: string | undefined;
  setFaculty: (value: string | undefined) => void;
  faculties: Faculty[];
  onAddCourse: () => void;
}

interface FilterFormValues {
  search: string;
  faculty: string | undefined;
}

export default function CourseFilterBar({
  search,
  setSearch,
  faculty,
  setFaculty,
  faculties,
  onAddCourse,
}: CourseFilterBarProps) {
  const [form] = Form.useForm<FilterFormValues>();

  const handleReset = () => {
    form.resetFields();
    setSearch("");
    setFaculty(undefined);
  };

  const handleValuesChange = (changedValues: Partial<FilterFormValues>) => {
    if ("search" in changedValues) {
      setSearch(changedValues.search || "");
    }
    if ("faculty" in changedValues) {
      setFaculty(changedValues.faculty);
    }
  };

  return (
    <Card className="mb-6 shadow-sm">
      <Form
        form={form}
        initialValues={{ search, faculty }}
        onValuesChange={handleValuesChange}
        className="flex flex-wrap gap-4 items-baseline"
      >
        <Typography.Text strong className="mr-4 text-base">
          Filters:
        </Typography.Text>
        <Form.Item name="search" className="mb-0 w-full sm:w-auto">
          <Input.Search
            placeholder="Search courses..."
            className="w-full sm:w-[220px]"
            allowClear
          />
        </Form.Item>
        <Form.Item name="faculty" className="mb-0 w-full sm:w-auto">
          <Select
            allowClear
            placeholder="All Faculties"
            className="w-full sm:w-[180px]"
          >
            {faculties.map((f) => (
              <Select.Option key={f.id} value={f.id}>
                {f.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Button onClick={handleReset} className="w-full sm:w-auto">
          Reset
        </Button>
        <div className="flex-1" />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddCourse}
          size="large"
          className="w-full sm:w-auto"
        >
          Add Course
        </Button>
      </Form>
    </Card>
  );
}
