import { gql } from "@apollo/client";

export const DASHBOARD_SUMMARY = gql`
  query DashboardSummary($limit: Int!) {
    dashboardSummary {
      totalStudents
      totalCourses
      totalFaculty
      topStudents(limit: $limit) {
        id
        name
        gpa
      }
      popularCourses(limit: $limit) {
        id
        name
        enrollmentCount
      }
    }
  }
`;
