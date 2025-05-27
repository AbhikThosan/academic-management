import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { STUDENTS, STUDENT, COURSES } from "@/app/lib/graphql/queries/students";

export interface Student {
  id: string;
  name: string;
  year: number;
  enrolledCourses: { id: string; name: string }[];
  grades: { courseId: string; courseName: string; grade: number }[];
  gpa: number;
}

interface StudentsResponse {
  students: {
    students: Student[];
    total: number;
    page: number;
    pageSize: number;
  };
}

interface StudentResponse {
  student: Student;
}

interface CoursesResponse {
  courses: {
    courses: { id: string; name: string }[];
    total: number;
    page: number;
    pageSize: number;
  };
}

interface StudentData {
  studentList: Array<{
    id: string;
    name: string;
    year: number;
    courses: string;
    gpa: number;
    gpaColor: string;
  }>;
  total: number;
  allCourses: Array<{ id: string; name: string }>;
  allYears: number[];
  loading: boolean;
  error: any;
  search: string;
  setSearch: (value: string) => void;
  course: string | undefined;
  setCourse: (value: string | undefined) => void;
  year: number | undefined;
  setYear: (value: number | undefined) => void;
  page: number;
  setPage: (value: number) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
}

export function useStudentData(): StudentData {
  const [search, setSearch] = useState<string>("");
  const [course, setCourse] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
  } = useQuery<CoursesResponse>(COURSES, {
    variables: {
      filter: {},
      page: 1,
      pageSize: 100, // Fetch up to 100 courses (adjust as needed)
    },
    fetchPolicy: "network-only",
  });

  const { data, loading, error } = useQuery<StudentsResponse>(STUDENTS, {
    variables: {
      filter: {
        search: search || undefined,
        courseId: course || undefined,
        year: year || undefined,
      },
      page,
      pageSize,
    },
    fetchPolicy: "network-only",
  });

  const studentList = useMemo(() => {
    return (data?.students.students || []).map((student) => ({
      id: student.id,
      name: student.name,
      year: student.year,
      courses: student.enrolledCourses.map((c) => c.name).join(", "),
      gpa: student.gpa,
      gpaColor:
        student.gpa >= 90
          ? "text-green-600"
          : student.gpa >= 80
          ? "text-yellow-600"
          : "text-red-600",
    }));
  }, [data]);

  const allCourses = useMemo(() => {
    return coursesData?.courses.courses || [];
  }, [coursesData]);

  const allYears = useMemo(() => {
    const years = new Set(data?.students.students.map((s) => s.year));
    return Array.from(years).sort();
  }, [data]);

  return {
    studentList,
    total: data?.students.total || 0,
    allCourses,
    allYears,
    loading: loading || coursesLoading,
    error: error || coursesError,
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
  };
}

export function useStudent(id: string) {
  const { data, loading, error } = useQuery<StudentResponse>(STUDENT, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  const studentDetail = useMemo(() => {
    if (!data?.student) return undefined;
    return {
      id: data.student.id,
      name: data.student.name,
      year: data.student.year,
      courses: data.student.enrolledCourses.map((c) => c.name).join(", "),
      grades: data.student.grades.map((g) => ({
        courseName: g.courseName,
        grade: g.grade,
      })),
      gpa: data.student.gpa,
      gpaColor:
        data.student.gpa >= 90
          ? "text-green-600"
          : data.student.gpa >= 80
          ? "text-yellow-600"
          : "text-red-600",
    };
  }, [data]);

  return {
    student: studentDetail,
    loading,
    error,
  };
}
