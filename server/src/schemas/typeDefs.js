const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type GradeMap {
    courseId: ID!
    grade: Float!
  }

  type Student {
    id: ID!
    userId: ID!
    name: String!
    year: Int!
    enrolledCourses: [Course]
    grades: [GradeMap]
  }

  type Course {
    id: ID!
    name: String!
    facultyId: ID!
    enrollmentCount: Int!
    enrolledStudents: [Student]
    enrollmentHistory: [EnrollmentHistory]
  }

  type EnrollmentHistory {
    timestamp: String!
    count: Int!
  }

  type Faculty {
    id: ID!
    userId: ID!
    name: String!
    department: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type StudentWithGPA {
    id: ID!
    name: String!
    gpa: Float!
  }

  type Summary {
    totalStudents: Int!
    totalCourses: Int!
    totalFaculty: Int!
  }

  type Query {
    getStudents(
      page: Int
      limit: Int
      search: String
      year: Int
      courseId: ID
    ): [Student]
    getStudent(id: ID!): Student
    getCourses(page: Int, limit: Int, search: String, facultyId: ID): [Course]
    getCourse(id: ID!): Course
    getFaculty: [Faculty]
    getFacultyMember(id: ID!): Faculty
    me: User
    getTopStudents(limit: Int!): [StudentWithGPA]
    getEnrollmentTrends(
      courseId: ID
      startDate: String
      endDate: String
    ): [EnrollmentHistory]
    getTopStudentsByCourse(courseId: ID!, limit: Int!): [StudentWithGPA]
    getTopStudentsByInstitute(department: String, limit: Int!): [StudentWithGPA]
    getSummary: Summary! # Added
  }

  type Mutation {
    register(email: String!, password: String!, role: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addStudent(name: String!, year: Int!): Student!
    updateStudent(id: ID!, name: String, year: Int): Student!
    deleteStudent(id: ID!): Boolean!
    addCourse(name: String!, facultyId: ID!): Course!
    updateCourse(id: ID!, name: String, facultyId: ID): Course!
    deleteCourse(id: ID!): Boolean!
    assignGrade(studentId: ID!, courseId: ID!, grade: Float!): Student!
    assignStudentToCourse(studentId: ID!, courseId: ID!): Course!
    addFaculty(name: String!, department: String!): Faculty!
    updateFaculty(id: ID!, name: String, department: String): Faculty!
    deleteFaculty(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
