const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type Student {
    id: ID!
    name: String!
    year: Int!
    enrolledCourses: [Course!]!
    grades: [Grade!]!
    gpa: Float!
  }

  type Course {
    id: ID!
    name: String!
    faculty: Faculty
    enrolledStudents: [Student!]!
    enrollmentCount: Int!
    grades: [Grade!]!
  }

  type Faculty {
    id: ID!
    name: String!
    assignedCourses: [Course!]!
  }

  type Grade {
    courseId: ID!
    courseName: String!
    grade: Float!
  }

  type StudentSummary {
    id: ID!
    name: String!
    gpa: Float!
    courseId: ID
    courseName: String
  }

  type CourseSummary {
    id: ID!
    name: String!
    enrollmentCount: Int!
  }

  type DashboardSummary {
    totalStudents: Int!
    totalCourses: Int!
    totalFaculty: Int!
    topStudents(limit: Int!): [StudentSummary!]!
    popularCourses(limit: Int!): [CourseSummary!]!
  }

  type StudentPaginatedResponse {
    students: [Student!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  type CoursePaginatedResponse {
    courses: [Course!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  type FacultyPaginatedResponse {
    facultyMembers: [Faculty!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  type EnrollmentDataPoint {
    courseId: ID!
    courseName: String!
    date: String!
    enrollmentCount: Int!
  }

  input StudentFilter {
    courseId: ID
    year: Int
    search: String
  }

  input CourseFilter {
    facultyId: ID
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

  input AddCourseInput {
    name: String!
    facultyId: ID
  }

  input UpdateCourseInput {
    id: ID!
    name: String
    facultyId: ID
  }

  input AddFacultyInput {
    name: String!
  }

  input UpdateFacultyInput {
    id: ID!
    name: String
  }

  input UpdateGradeInput {
    studentId: ID!
    courseId: ID!
    grade: Float!
  }

  input EnrollmentReportFilter {
    courseId: ID
    startDate: String
    endDate: String
  }

  input TopStudentsFilter {
    courseId: ID
    limit: Int!
  }

  input ExportReportInput {
    type: String!
    filter: ReportFilter
  }

  input ReportFilter {
    courseId: ID
    startDate: String
    endDate: String
    limit: Int
  }

  type Query {
    dashboardSummary(limit: Int): DashboardSummary!
    students(
      filter: StudentFilter
      page: Int!
      pageSize: Int!
    ): StudentPaginatedResponse!
    student(id: ID!): Student!
    courses(
      filter: CourseFilter
      page: Int!
      pageSize: Int!
    ): CoursePaginatedResponse!
    facultyMembers(page: Int!, pageSize: Int!): FacultyPaginatedResponse!
    courseEnrollmentReport(
      filter: EnrollmentReportFilter
    ): [EnrollmentDataPoint!]!
    topStudentsReport(filter: TopStudentsFilter): [StudentSummary!]!
  }

  type Mutation {
    register(email: String!, password: String!, role: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addStudent(input: AddStudentInput!): Student!
    updateStudent(input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!
    addCourse(input: AddCourseInput!): Course!
    updateCourse(input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    addFaculty(input: AddFacultyInput!): Faculty!
    updateFaculty(input: UpdateFacultyInput!): Faculty!
    deleteFaculty(id: ID!): Boolean!
    assignCourseToFaculty(courseId: ID!, facultyId: ID!): Course!
    assignStudentToCourse(studentId: ID!, courseId: ID!): Course!
    updateStudentGrade(input: UpdateGradeInput!): Grade!
    exportReport(input: ExportReportInput!): String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

module.exports = typeDefs;
