const { gql } = require("apollo-server-express");

const courseSchema = gql`
  type Faculty # Stub type to resolve cyclic dependency
  type Course {
    id: ID!
    name: String!
    faculty: Faculty
    enrolledStudents: [Student!]!
    enrollmentCount: Int!
    grades: [Grade!]!
  }

  type CoursePaginatedResponse {
    courses: [Course!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  input CourseFilter {
    facultyId: ID
    search: String
  }

  input AddCourseInput {
    name: String!
    facultyId: ID
  }

  input UpdateCourseInput {
    id: ID!
    name: String
    facultyId: ID
  }

  extend type Query {
    courses(
      filter: CourseFilter
      page: Int!
      pageSize: Int!
    ): CoursePaginatedResponse!
  }

  extend type Mutation {
    addCourse(input: AddCourseInput!): Course!
    updateCourse(input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    assignStudentToCourse(studentId: ID!, courseId: ID!): Course!
  }
`;

module.exports = courseSchema;
