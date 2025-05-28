import { gql } from "@apollo/client";

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
