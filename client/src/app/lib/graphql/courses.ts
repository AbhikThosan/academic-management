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

export const ADD_COURSE = gql`
  mutation AddCourse($input: AddCourseInput!) {
    addCourse(input: $input) {
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
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($input: UpdateCourseInput!) {
    updateCourse(input: $input) {
      id
      name
      faculty {
        id
        name
      }
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;
