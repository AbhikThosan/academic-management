"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { message } from "antd";
import {
  COURSES,
  FACULTY_MEMBERS,
  ADD_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE,
} from "@/app/lib/graphql/courses";

export interface Course {
  id: string;
  name: string;
  faculty: { id: string; name: string } | null;
  enrolledStudents: { id: string; name: string }[];
  enrollmentCount: number;
}

export interface Faculty {
  id: string;
  name: string;
}

interface CoursesResponse {
  courses: {
    courses: Course[];
    total: number;
    page: number;
    pageSize: number;
  };
}

interface FacultyMembersResponse {
  facultyMembers: {
    facultyMembers: Faculty[];
    total: number;
  };
}

interface AddCourseInput {
  name: string;
  facultyId?: string;
}

interface UpdateCourseInput {
  id: string;
  name: string;
  facultyId?: string;
}

export function useCourses() {
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
  } = useQuery<CoursesResponse>(COURSES, {
    variables: {
      filter: {
        search: search || undefined,
        facultyId: faculty || undefined,
      },
      page,
      pageSize,
    },
    fetchPolicy: "network-only",
  });

  const {
    data: facultyData,
    loading: facultyLoading,
    error: facultyError,
  } = useQuery<FacultyMembersResponse>(FACULTY_MEMBERS, {
    variables: {
      page: 1,
      pageSize: 100,
    },
    fetchPolicy: "network-only",
  });

  const [addCourseMutation] = useMutation(ADD_COURSE, {
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    },
    onError: (error) => {
      message.error(`Failed to add course: ${error.message}`);
    },
    update: (cache, { data: { addCourse } }) => {
      const existing = cache.readQuery<CoursesResponse>({
        query: COURSES,
        variables: { filter: {}, page: 1, pageSize },
      });
      if (existing) {
        cache.writeQuery<CoursesResponse>({
          query: COURSES,
          variables: { filter: {}, page: 1, pageSize },
          data: {
            courses: {
              ...existing.courses,
              courses: [addCourse, ...existing.courses.courses],
              total: existing.courses.total + 1,
            },
          },
        });
      }
    },
  });

  const [updateCourseMutation] = useMutation(UPDATE_COURSE, {
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    },
    onError: (error) => {
      message.error(`Failed to update course: ${error.message}`);
    },
    update: (cache, { data: { updateCourse } }) => {
      cache.modify({
        fields: {
          courses(existingCourses = { courses: [] }) {
            return {
              ...existingCourses,
              courses: existingCourses.courses.map((course: Course) =>
                course.id === updateCourse.id ? updateCourse : course
              ),
            };
          },
        },
      });
    },
  });

  const [deleteCourseMutation] = useMutation(DELETE_COURSE, {
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    },
    onError: (error) => {
      message.error(`Failed to delete course: ${error.message}`);
    },
    update: (cache, _, { variables }) => {
      const existing = cache.readQuery<CoursesResponse>({
        query: COURSES,
        variables: { filter: {}, page: 1, pageSize },
      });
      if (existing) {
        cache.writeQuery<CoursesResponse>({
          query: COURSES,
          variables: { filter: {}, page: 1, pageSize },
          data: {
            courses: {
              ...existing.courses,
              courses: existing.courses.courses.filter(
                (course: Course) => course.id !== variables?.id
              ),
              total: existing.courses.total - 1,
            },
          },
        });
      }
    },
  });

  const addCourse = async (input: AddCourseInput) => {
    await addCourseMutation({
      variables: { input },
      optimisticResponse: {
        addCourse: {
          id: `temp-${Date.now()}`,
          name: input.name,
          faculty: input.facultyId
            ? {
                id: input.facultyId,
                name:
                  facultyData?.facultyMembers.facultyMembers.find(
                    (f) => f.id === input.facultyId
                  )?.name || "Unknown",
              }
            : null,
          enrolledStudents: [],
          enrollmentCount: 0,
        },
      },
    });
  };

  const editCourse = async (
    id: string,
    updates: Partial<UpdateCourseInput>
  ) => {
    await updateCourseMutation({
      variables: { input: { id, ...updates } },
      optimisticResponse: {
        updateCourse: {
          id,
          name: updates.name || "",
          faculty: updates.facultyId
            ? {
                id: updates.facultyId,
                name:
                  facultyData?.facultyMembers.facultyMembers.find(
                    (f) => f.id === updates.facultyId
                  )?.name || "Unknown",
              }
            : null,
        },
      },
    });
  };

  const deleteCourse = async (id: string) => {
    await deleteCourseMutation({
      variables: { id },
      optimisticResponse: {
        deleteCourse: true,
      },
    });
  };

  const faculties = useMemo(() => {
    return facultyData?.facultyMembers.facultyMembers || [];
  }, [facultyData]);

  if (coursesError) {
    message.error(`Courses error: ${coursesError.message}`);
  }
  if (facultyError) {
    message.error(`Faculties error: ${facultyError.message}`);
  }

  return {
    courses: coursesData?.courses.courses || [],
    faculties,
    search,
    setSearch,
    faculty,
    setFaculty,
    page,
    setPage,
    pageSize,
    setPageSize,
    total: coursesData?.courses.total || 0,
    loading: coursesLoading || facultyLoading,
    drawerOpen,
    setDrawerOpen,
    addCourse,
    editCourse,
    deleteCourse,
  };
}
