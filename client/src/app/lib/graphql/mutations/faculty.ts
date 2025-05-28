import { gql } from "@apollo/client";

export const ASSIGN_STUDENT_TO_COURSE = gql`
  mutation AssignStudentToCourse($studentId: ID!, $courseId: ID!) {
    assignStudentToCourse(studentId: $studentId, courseId: $courseId) {
      id
      name
      enrolledStudents {
        id
        name
      }
      enrollmentCount
    }
  }
`;

export const UPDATE_STUDENT_GRADE = gql`
  mutation UpdateStudentGrade($input: UpdateGradeInput!) {
    updateStudentGrade(input: $input) {
      courseId
      courseName
      grade
    }
  }
`;
