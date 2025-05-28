import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { STUDENT } from "@/app/lib/graphql/queries/students";
import { Student } from "./useStudentData";

interface StudentResponse {
  student: Student;
}

interface StudentDetail {
  id: string;
  name: string;
  year: number;
  courses: string;
  grades: Array<{
    courseName: string;
    grade: number;
  }>;
  gpa: number;
  gpaColor: string;
}

interface UseStudentResult {
  student: StudentDetail | undefined;
  loading: boolean;
  error: Error | undefined;
}

export function useStudent(id: string): UseStudentResult {
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
