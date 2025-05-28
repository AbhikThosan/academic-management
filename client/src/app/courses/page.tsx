"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Row, Col, Empty, Pagination } from "antd";
import { useCourses, Course } from "../hooks/useCourses";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import CourseFilterBar from "./components/CourseFilterBar";
import CourseDrawer from "./components/CourseDrawer";
import CourseCard from "./components/CourseCard";

export default function CoursesPage() {
  const { courses, faculties, filter, pagination, loading, drawer, mutations } =
    useCourses();

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleAddCourse = (values: {
    name: string;
    faculty: string | undefined;
  }) => {
    mutations.addCourse({ name: values.name, facultyId: values.faculty });
    drawer.setOpen(false);
    toast.success("Course added");
  };

  const handleEditCourse = (values: {
    name: string;
    faculty: string | undefined;
    id?: string;
  }) => {
    if (values.id) {
      mutations.editCourse(values.id, {
        name: values.name,
        facultyId: values.faculty,
      });
      toast.success("Course updated");
    }
    setEditingCourse(null);
    drawer.setOpen(false);
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setDrawerMode("edit");
    drawer.setOpen(true);
  };

  const handleAddClick = () => {
    setEditingCourse(null);
    setDrawerMode("add");
    drawer.setOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      try {
        await mutations.deleteCourse(courseToDelete.id);
        toast.success("Course deleted");
        await mutations.refetchCourses();
      } catch {
        // Error is already handled in the mutation hook
      }
    }
    setDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 mt-6">
      <CourseFilterBar
        search={filter.search}
        setSearch={filter.setSearch}
        faculty={filter.faculty}
        setFaculty={filter.setFaculty}
        faculties={faculties}
        onAddCourse={handleAddClick}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mt-6 sm:mt-12">
            {courses.length === 0 ? (
              <Col span={24}>
                <Empty description="No courses found" />
              </Col>
            ) : (
              courses.map((course) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={course.id}
                  className="flex"
                >
                  <CourseCard
                    course={course}
                    onEdit={() => handleEditClick(course)}
                    onDelete={() => handleDeleteClick(course)}
                  />
                </Col>
              ))
            )}
          </Row>
          <div className="mt-4 flex justify-end">
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={pagination.setPage}
              onShowSizeChange={(_, size) => pagination.setPageSize(size)}
              pageSizeOptions={[10, 25, 50, 100]}
              responsive
              showSizeChanger
            />
          </div>
        </>
      )}
      <CourseDrawer
        open={drawer.open}
        onClose={() => {
          drawer.setOpen(false);
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
