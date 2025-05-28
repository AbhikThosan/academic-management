import { gql } from "@apollo/client";

export const COURSES = gql`
  query Courses($filter: CourseFilter, $page: Int!, $pageSize: Int!) {
    courses(filter: $filter, page: $page, pageSize: $pageSize) {
      courses {
        id
        name
        faculty {
          id
          name
        }
        enrolledStudents {
          id
          name
        }
        enrollmentCount
      }
      total
      page
      pageSize
    }
  }
`;

export const COURSES_DROPDOWN = gql`
  query Courses($filter: CourseFilter, $page: Int!, $pageSize: Int!) {
    courses(filter: $filter, page: $page, pageSize: $pageSize) {
      courses {
        id
        name
      }
      total
      page
      pageSize
    }
  }
`;

export const FACULTY_MEMBERS = gql`
  query FacultyMembers($page: Int!, $pageSize: Int!) {
    facultyMembers(page: $page, pageSize: $pageSize) {
      facultyMembers {
        id
        name
      }
      total
    }
  }
`;
