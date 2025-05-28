import { useQuery, useMutation } from "@apollo/client";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { STUDENTS_DROPDOWN } from "../lib/graphql/queries/students";
import {
  ASSIGN_STUDENT_TO_COURSE,
  UPDATE_STUDENT_GRADE,
} from "../lib/graphql/mutations/faculty";
import { COURSES_DROPDOWN } from "../lib/graphql/queries/courses";

export interface Course {
  id: string;
  name: string;
}

export interface Student {
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

interface StudentsResponse {
  students: {
    students: Student[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const useFacultyForms = () => {
  const { data: coursesData, loading: coursesLoading } =
    useQuery<CoursesResponse>(COURSES_DROPDOWN, {
      variables: { filter: {}, page: 1, pageSize: 100 },
      context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
    });

  const { data: studentsData, loading: studentsLoading } =
    useQuery<StudentsResponse>(STUDENTS_DROPDOWN, {
      variables: { filter: {}, page: 1, pageSize: 100 },
      context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
    });

  const courses = useMemo(
    () => coursesData?.courses.courses || [],
    [coursesData]
  );
  const students = useMemo(
    () => studentsData?.students.students || [],
    [studentsData]
  );

  const [assignStudentToCourseMutation] = useMutation(
    ASSIGN_STUDENT_TO_COURSE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
      onCompleted: () => {
        toast.success("Student assigned to course successfully");
      },
      onError: (error) => {
        toast.error(`Failed to assign student: ${error.message}`);
      },
    }
  );

  const [updateStudentGradeMutation] = useMutation(UPDATE_STUDENT_GRADE, {
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    },
    onCompleted: () => {
      toast.success("Grade assigned successfully");
    },
    onError: (error) => {
      toast.error(`Failed to assign grade: ${error.message}`);
    },
  });

  const handleAssignStudent = async (values: {
    course: string;
    student: string;
  }) => {
    const course = courses.find((c) => c.id === values.course);
    const student = students.find((s) => s.id === values.student);
    if (!course || !student) {
      toast.error("Invalid course or student selected");
      return;
    }
    await assignStudentToCourseMutation({
      variables: {
        studentId: student.id,
        courseId: course.id,
      },
    });
  };

  const handleAssignGrade = async (values: {
    course: string;
    student: string;
    grade: number;
  }) => {
    const course = courses.find((c) => c.id === values.course);
    const student = students.find((s) => s.id === values.student);
    const grade = values.grade;
    if (!course || !student) {
      toast.error("Invalid course or student selected");
      return;
    }
    if (isNaN(grade) || grade < 0 || grade > 4) {
      toast.error("Grade must be a number between 0 and 4");
      return;
    }
    await updateStudentGradeMutation({
      variables: {
        input: {
          studentId: student.id,
          courseId: course.id,
          grade,
        },
      },
    });
  };

  return {
    courses,
    students,
    loading: coursesLoading || studentsLoading,
    handleAssignGrade,
    handleAssignStudent,
  };
};
