import React from "react";
import { Input, Select, Button, Card, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Faculty } from "@/app/lib/hooks/useCourses";

interface CourseFilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  faculty: string | undefined;
  setFaculty: (value: string | undefined) => void;
  faculties: Faculty[];
  onAddCourse: () => void;
}

export default function CourseFilterBar({
  search,
  setSearch,
  faculty,
  setFaculty,
  faculties,
  onAddCourse,
}: CourseFilterBarProps) {
  return (
    <Card className="mb-6 shadow-sm">
      <div className="flex flex-wrap gap-4 items-center">
        <Typography.Text strong className="mr-4 text-base">
          Filters:
        </Typography.Text>
        <Input.Search
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />
        <Select
          allowClear
          placeholder="All Faculties"
          value={faculty}
          onChange={setFaculty}
          style={{ width: 180 }}
        >
          {faculties.map((f) => (
            <Select.Option key={f.id} value={f.id}>
              {f.name}
            </Select.Option>
          ))}
        </Select>
        <div className="flex-1" />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddCourse}
          size="large"
        >
          Add Course
        </Button>
      </div>
    </Card>
  );
}
