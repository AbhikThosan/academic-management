"use client";
import React, { useState } from "react";
import { Row, Col, Empty, message, Pagination } from "antd";
import { useCourses, Course } from "../lib/hooks/useCourses";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import CourseFilterBar from "./components/CourseFilterBar";
import CourseDrawer from "./components/CourseDrawer";
import CourseCard from "./components/CourseCard";

export default function CoursesPage() {
  const {
    courses,
    faculties,
    search,
    setSearch,
    faculty,
    setFaculty,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    loading,
    drawerOpen,
    setDrawerOpen,
    addCourse,
    deleteCourse,
    editCourse,
  } = useCourses();

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleAddCourse = (values: {
    name: string;
    faculty: string | undefined;
  }) => {
    addCourse({ name: values.name, facultyId: values.faculty });
    setDrawerOpen(false);
    message.success("Course added");
  };

  const handleEditCourse = (values: {
    name: string;
    faculty: string | undefined;
    id?: string;
  }) => {
    if (values.id) {
      editCourse(values.id, { name: values.name, facultyId: values.faculty });
      message.success("Course updated");
    }
    setEditingCourse(null);
    setDrawerOpen(false);
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleAddClick = () => {
    setEditingCourse(null);
    setDrawerMode("add");
    setDrawerOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete.id);
      message.success("Course deleted");
    }
    setDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-black">Course Management</h1>
      <CourseFilterBar
        search={search}
        setSearch={setSearch}
        faculty={faculty}
        setFaculty={setFaculty}
        faculties={faculties}
        onAddCourse={handleAddClick}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Row gutter={[24, 24]} className="mt-12">
            {courses.length === 0 ? (
              <Col span={24}>
                <Empty description="No courses found" />
              </Col>
            ) : (
              courses.map((course) => (
                <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                  <CourseCard
                    course={course}
                    onEdit={() => handleEditClick(course)}
                    onDelete={() => handleDeleteClick(course)}
                  />
                </Col>
              ))
            )}
          </Row>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            onShowSizeChange={(_, size) => setPageSize(size)}
            pageSizeOptions={[10, 25, 50, 100]}
            className="mt-4 text-right"
          />
        </>
      )}
      <CourseDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={drawerMode === "edit" ? handleEditCourse : handleAddCourse}
        faculties={faculties}
        mode={drawerMode}
        initialValues={
          editingCourse
            ? {
                name: editingCourse.name,
                faculty: editingCourse.faculty?.id,
                id: editingCourse.id,
              }
            : undefined
        }
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete Course"
        content={`Are you sure you want to delete "${courseToDelete?.name}"?`}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
