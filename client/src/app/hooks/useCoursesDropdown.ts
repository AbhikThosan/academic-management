import { useQuery } from "@apollo/client";
import { COURSES_DROPDOWN } from "../lib/graphql/queries/courses";

interface Course {
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

export function useCoursesDropdown() {
  const { data, loading, error } = useQuery<CoursesResponse>(COURSES_DROPDOWN, {
    variables: { filter: {}, page: 1, pageSize: 100 },
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    },
  });

  return {
    courses: data?.courses.courses || [],
    loading,
    error,
  };
}
