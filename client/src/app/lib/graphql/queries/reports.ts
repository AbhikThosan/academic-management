import { gql } from "@apollo/client";

export const COURSE_ENROLLMENT_REPORT = gql`
  query CourseEnrollmentReport($filter: EnrollmentReportFilter) {
    courseEnrollmentReport(filter: $filter) {
      courseId
      courseName
      date
      enrollmentCount
    }
  }
`;

export const TOP_STUDENTS_REPORT = gql`
  query TopStudentsReport($filter: TopStudentsFilter) {
    topStudentsReport(filter: $filter) {
      id
      name
      gpa
      courseId
      courseName
    }
  }
`;
//report page
