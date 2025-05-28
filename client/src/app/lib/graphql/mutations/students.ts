import { gql } from "@apollo/client";

export const ADD_STUDENT = gql`
  mutation AddStudent($input: AddStudentInput!) {
    addStudent(input: $input) {
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
    }
  }
`;

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($input: UpdateStudentInput!) {
    updateStudent(input: $input) {
      id
      name
      year
    }
  }
`;

export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`;
