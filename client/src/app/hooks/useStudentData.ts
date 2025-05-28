import { useState, useMemo } from "react";
import { ApolloError, useQuery } from "@apollo/client";
import { STUDENTS, COURSES } from "@/app/lib/graphql/queries/students";

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

interface CoursesResponse {
  courses: {
    courses: { id: string; name: string }[];
    total: number;
    page: number;
    pageSize: number;
  };
}

interface StudentListItem {
  id: string;
  name: string;
  year: number;
  courses: string;
  gpa: number;
  gpaColor: string;
}

interface UseStudentDataResult {
  studentList: StudentListItem[];
  total: number;
  filter: {
    search: string;
    setSearch: (value: string) => void;
    course: string | undefined;
    setCourse: (value: string | undefined) => void;
    year: number | undefined;
    setYear: (value: number | undefined) => void;
  };
  pagination: {
    page: number;
    setPage: (value: number) => void;
    pageSize: number;
    setPageSize: (value: number) => void;
  };
  options: {
    allCourses: Array<{ id: string; name: string }>;
    allYears: number[];
  };
  loading: boolean;
  error: ApolloError | undefined;
  refetchStudents: () => void;
}

export function useStudentData(): UseStudentDataResult {
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

  const { data, loading, error, refetch } = useQuery<StudentsResponse>(
    STUDENTS,
    {
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
    }
  );

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
    return [1, 2, 3, 4];
  }, []);

  return {
    studentList,
    total: data?.students.total || 0,
    filter: {
      search,
      setSearch,
      course,
      setCourse,
      year,
      setYear,
    },
    pagination: {
      page,
      setPage,
      pageSize,
      setPageSize,
    },
    options: {
      allCourses,
      allYears,
    },
    loading: loading || coursesLoading,
    error: error || coursesError,
    refetchStudents: refetch,
  };
}
