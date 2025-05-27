"use client";
import React from "react";
import { Table, Input, Select, Pagination, Button } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined } from "@ant-design/icons";
import { useStudentData } from "@/app/lib/hooks/useStudentData";

const { Option } = Select;

export default function StudentTable() {
  const {
    studentList,
    total,
    search,
    setSearch,
    course,
    setCourse,
    year,
    setYear,
    page,
    setPage,
    pageSize,
    setPageSize,
    allCourses,
    allYears,
    loading,
    error,
  } = useStudentData();
  const router = useRouter();

  const handleReset = () => {
    setSearch("");
    setCourse(undefined);
    setYear(undefined);
    setPage(1);
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      render: (_: unknown, record: any) => (
        <div className="flex items-center gap-3">
          <div className="font-medium">{record.name}</div>
        </div>
      ),
    },
    {
      title: "Courses",
      dataIndex: "courses",
      key: "courses",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      render: (_: unknown, record: any) => (
        <span className={record.gpaColor}>{record.gpa.toFixed(2)}</span>
      ),
    },
  ];

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Select
            allowClear
            placeholder="All Courses"
            value={course}
            onChange={setCourse}
            style={{ width: 150 }}
          >
            {allCourses.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            placeholder="All Years"
            value={year}
            onChange={setYear}
            style={{ width: 120 }}
          >
            {allYears.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
          <div className="ml-auto flex gap-2">
            <Button type="primary">Filter</Button>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Showing {studentList.length} of {total} students
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={studentList}
        rowKey="id"
        pagination={false}
        loading={loading}
        onRow={(record) => ({
          onClick: () => router.push(`/students/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      <div className="flex justify-end p-4 border-t">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          showSizeChanger
          onShowSizeChange={(_, size) => setPageSize(size)}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
