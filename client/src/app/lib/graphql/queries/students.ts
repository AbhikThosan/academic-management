import { gql } from "@apollo/client";

export const STUDENTS = gql`
  query Students($filter: StudentFilter, $page: Int!, $pageSize: Int!) {
    students(filter: $filter, page: $page, pageSize: $pageSize) {
      students {
        id
        name
        year
        enrolledCourses {
          id
          name
        }
        grades {
          courseId
          courseName
          grade
        }
        gpa
      }
      total
      page
      pageSize
    }
  }
`;

export const STUDENT = gql`
  query Student($id: ID!) {
    student(id: $id) {
      id
      name
      year
      enrolledCourses {
        id
        name
      }
      grades {
        courseId
        courseName
        grade
      }
      gpa
    }
  }
`;

export const COURSES = gql`
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
