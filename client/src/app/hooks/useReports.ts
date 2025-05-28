import { useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { COURSES_DROPDOWN } from "../lib/graphql/queries/courses";
import {
  COURSE_ENROLLMENT_REPORT,
  TOP_STUDENTS_REPORT,
} from "../lib/graphql/queries/reports";
import { format } from "date-fns";
import { unparse } from "papaparse";

export interface Course {
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

interface CourseEnrollmentReportItem {
  courseId: string;
  courseName: string;
  date: string;
  enrollmentCount: number;
}

interface TopStudentsReportItem {
  id: string;
  name: string;
  gpa: number;
  courseId: string;
  courseName: string;
}

interface CourseEnrollmentReportResponse {
  courseEnrollmentReport: CourseEnrollmentReportItem[];
}

interface TopStudentsReportResponse {
  topStudentsReport: TopStudentsReportItem[];
}

export const useReports = () => {
  const [enrollmentCourseId, setEnrollmentCourseId] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  const [topStudentsCourseId, setTopStudentsCourseId] = useState<
    string | undefined
  >();
  const [limit, setLimit] = useState<number>(5);

  const { data: coursesData, loading: coursesLoading } =
    useQuery<CoursesResponse>(COURSES_DROPDOWN, {
      variables: { filter: {}, page: 1, pageSize: 100 },
      context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
    });

  const { data: enrollmentData, loading: enrollmentLoading } =
    useQuery<CourseEnrollmentReportResponse>(COURSE_ENROLLMENT_REPORT, {
      variables: {
        filter: {
          courseId: enrollmentCourseId || undefined,
          startDate: dateRange ? dateRange[0] : undefined,
          endDate: dateRange ? dateRange[1] : undefined,
        },
      },
      skip: !enrollmentCourseId && !dateRange,
      context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
      onError: (error) => {
        toast.error(`Failed to fetch enrollment report: ${error.message}`);
      },
    });

  const { data: topStudentsData, loading: topStudentsLoading } =
    useQuery<TopStudentsReportResponse>(TOP_STUDENTS_REPORT, {
      variables: {
        filter: {
          courseId: topStudentsCourseId || undefined,
          limit,
        },
      },
      skip: !topStudentsCourseId && !limit,
      context: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
      onError: (error) => {
        toast.error(`Failed to fetch top students report: ${error.message}`);
      },
    });

  const courses = useMemo(
    () => coursesData?.courses.courses || [],
    [coursesData]
  );

  const enrollmentReport = useMemo(
    () => enrollmentData?.courseEnrollmentReport || [],
    [enrollmentData]
  );
  const topStudentsReport = useMemo(
    () => topStudentsData?.topStudentsReport || [],
    [topStudentsData]
  );

  const handleEnrollmentFilter = (values: {
    courseId?: string;
    dateRange?: [Date, Date];
  }) => {
    setEnrollmentCourseId(values.courseId);
    if (values.dateRange) {
      setDateRange([
        format(values.dateRange[0], "yyyy-MM-dd"),
        format(values.dateRange[1], "yyyy-MM-dd"),
      ]);
    } else {
      setDateRange(undefined);
    }
  };

  const handleTopStudentsFilter = (values: {
    courseId?: string;
    limit: number;
  }) => {
    setTopStudentsCourseId(values.courseId);
    setLimit(values.limit);
  };

  const exportEnrollmentReport = () => {
    if (!enrollmentReport.length) {
      toast.error("No data to export");
      return;
    }
    const csvData = enrollmentReport.map((item) => ({
      "Course ID": item.courseId,
      "Course Name": item.courseName,
      Date: item.date,
      "Enrollment Count": item.enrollmentCount,
    }));
    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "course_enrollment_report.csv");
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Enrollment report exported successfully");
  };

  const exportTopStudentsReport = () => {
    if (!topStudentsReport.length) {
      toast.error("No data to export");
      return;
    }
    const csvData = topStudentsReport.map((item) => ({
      "Student ID": item.id,
      "Student Name": item.name,
      GPA: item.gpa,
      "Course ID": item.courseId || "N/A",
      "Course Name": item.courseName || "N/A",
    }));
    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "top_students_report.csv");
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Top students report exported successfully");
  };

  return {
    courses,
    enrollmentReport,
    topStudentsReport,
    loading: coursesLoading || enrollmentLoading || topStudentsLoading,
    handleEnrollmentFilter,
    handleTopStudentsFilter,
    exportEnrollmentReport,
    exportTopStudentsReport,
  };
};
