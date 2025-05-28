"use client";
import React, { useState } from "react";
import { Table, Input, Select, Pagination, Button, Modal, Space } from "antd";
import { useRouter } from "next/navigation";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useStudentData } from "@/app/hooks/useStudentData";
import { useStudentMutations } from "@/app/hooks/useStudentMutations";
import AddStudentDrawer from "./AddStudentDrawer";
import EditStudentDrawer from "./EditStudentDrawer";

const { Option } = Select;

interface Student {
  id: string;
  name: string;
  courses: string;
  year: number;
  gpa: number;
  gpaColor: string;
}

export default function StudentTable() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const {
    studentList,
    total,
    filter,
    pagination,
    options,
    loading,
    error,
    refetchStudents,
  } = useStudentData();

  const { deleteStudent, loading: deleteLoading } = useStudentMutations();
  const router = useRouter();

  const handleReset = () => {
    filter.setSearch("");
    filter.setCourse(undefined);
    filter.setYear(undefined);
    pagination.setPage(1);
  };

  const handleEdit = (record: Student) => {
    setSelectedStudent(record);
    setEditDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      refetchStudents();
    } catch {
      // Error is handled in the mutation hook
    }
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      render: (_: unknown, record: Student) => (
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
      render: (_: unknown, record: Student) => (
        <span className={record.gpaColor}>{record.gpa.toFixed(2)}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Student) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
          />
        </Space>
      ),
    },
  ];

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
          <Input
            placeholder="Search students..."
            value={filter.search}
            onChange={(e) => filter.setSearch(e.target.value)}
            className="sm:w-full !w-[200px]"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Select
            allowClear
            placeholder="All Courses"
            value={filter.course}
            onChange={filter.setCourse}
            className="w-full sm:w-auto"
          >
            {options.allCourses.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            placeholder="All Years"
            value={filter.year}
            onChange={filter.setYear}
            className="w-full sm:w-auto"
          >
            {options.allYears.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
          <Button onClick={handleReset} className="w-full sm:w-auto">
            Reset
          </Button>
          <div className="w-full sm:w-auto ml-auto">
            <Button
              type="primary"
              onClick={() => setDrawerOpen(true)}
              className="w-full sm:w-auto"
            >
              Add Student
            </Button>
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
        onRow={(record: Student) => ({
          onClick: () => router.push(`/students/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      <div className="flex justify-end p-4 border-t">
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onChange={pagination.setPage}
          showSizeChanger
          onShowSizeChange={(_, size) => pagination.setPageSize(size)}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      <AddStudentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refetchStudents}
      />

      <EditStudentDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={refetchStudents}
        student={selectedStudent}
      />

      <Modal
        title="Delete Student"
        open={deleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        confirmLoading={deleteLoading}
        okButtonProps={{ danger: true }}
        okText="Delete"
      >
        <p>
          Are you sure you want to delete this student? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
