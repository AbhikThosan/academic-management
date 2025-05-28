const { gql } = require("apollo-server-express");

const facultySchema = gql`
  type Faculty {
    id: ID!
    name: String!
    assignedCourses: [Course!]!
  }

  type FacultyPaginatedResponse {
    facultyMembers: [Faculty!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  input AddFacultyInput {
    name: String!
  }

  input UpdateFacultyInput {
    id: ID!
    name: String
  }

  extend type Query {
    facultyMembers(page: Int!, pageSize: Int!): FacultyPaginatedResponse!
  }

  extend type Mutation {
    addFaculty(input: AddFacultyInput!): Faculty!
    updateFaculty(input: UpdateFacultyInput!): Faculty!
    deleteFaculty(id: ID!): Boolean!
    assignCourseToFaculty(courseId: ID!, facultyId: ID!): Course!
  }
`;

module.exports = facultySchema;
