const { gql } = require("apollo-server-express");

const studentSchema = gql`
  type Student {
    id: ID!
    name: String!
    year: Int!
    enrolledCourses: [Course!]!
    grades: [Grade!]!
    gpa: Float!
  }

  type StudentPaginatedResponse {
    students: [Student!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  input StudentFilter {
    courseId: ID
    year: Int
    search: String
  }

  input AddStudentInput {
    name: String!
    year: Int!
  }

  input UpdateStudentInput {
    id: ID!
    name: String
    year: Int
  }

  extend type Query {
    students(
      filter: StudentFilter
      page: Int!
      pageSize: Int!
    ): StudentPaginatedResponse!
    student(id: ID!): Student!
  }

  extend type Mutation {
    addStudent(input: AddStudentInput!): Student!
    updateStudent(input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!
  }
`;

module.exports = studentSchema;
