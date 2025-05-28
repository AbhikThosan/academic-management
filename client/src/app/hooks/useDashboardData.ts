import { ApolloError, useQuery } from "@apollo/client";
import { DASHBOARD_SUMMARY } from "@/app/lib/graphql/queries/dashboardSummary";
import type { ApexOptions } from "apexcharts";

interface DashboardSummary {
  totalStudents: number;
  totalCourses: number;
  totalFaculty: number;
  topStudents: Array<{ id: string; name: string; gpa: number }>;
  popularCourses: Array<{ id: string; name: string; enrollmentCount: number }>;
}

interface DashboardData {
  summaryData: Array<{
    title: string;
    value: number;
    color: string;
    bg: string;
  }>;
  courseEnrollments: {
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  };
  topStudents: Array<{
    id: string;
    name: string;
    gpa: number;
    color: string;
    tag: string;
  }>;
  loading: boolean;
  error: ApolloError | undefined;
}

export function useDashboardData(): DashboardData {
  const { data, loading, error } = useQuery<{
    dashboardSummary: DashboardSummary;
  }>(DASHBOARD_SUMMARY, {
    variables: { limit: 5 },
    fetchPolicy: "network-only",
  });

  const summaryData = [
    {
      title: "Total Students",
      value: data?.dashboardSummary.totalStudents || 0,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Courses",
      value: data?.dashboardSummary.totalCourses || 0,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Faculty Members",
      value: data?.dashboardSummary.totalFaculty || 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  const courseEnrollments = {
    series: [
      {
        name: "Enrollments",
        data:
          data?.dashboardSummary.popularCourses.map(
            (course) => course.enrollmentCount
          ) || [],
      },
    ],
    options: {
      chart: { type: "bar" as const, height: 250, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: "40%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories:
          data?.dashboardSummary.popularCourses.map((course) => course.name) ||
          [],
      },
      colors: ["#1677ff"],
    } as ApexOptions,
  };

  const topStudents = (data?.dashboardSummary.topStudents || []).map(
    (student, index) => {
      const colors = [
        { color: "bg-orange-100", tag: "#faad14" },
        { color: "bg-green-100", tag: "#52c41a" },
        { color: "bg-blue-100", tag: "#1890ff" },
        { color: "bg-purple-100", tag: "#722ed1" },
        { color: "bg-red-100", tag: "#f5222d" },
      ];
      const { color, tag } = colors[index % colors.length];
      return {
        id: student.id,
        name: student.name,
        gpa: student.gpa,
        color,
        tag,
      };
    }
  );

  return { summaryData, courseEnrollments, topStudents, loading, error };
}
