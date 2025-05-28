const { gql } = require("apollo-server-express");

const sharedTypes = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
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

  type EnrollmentDataPoint {
    courseId: ID!
    courseName: String!
    date: String!
    enrollmentCount: Int!
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

  extend type Query {
    dashboardSummary(limit: Int): DashboardSummary!
    courseEnrollmentReport(
      filter: EnrollmentReportFilter
    ): [EnrollmentDataPoint!]!
    topStudentsReport(filter: TopStudentsFilter): [StudentSummary!]!
  }

  extend type Mutation {
    updateStudentGrade(input: UpdateGradeInput!): Grade!
    exportReport(input: ExportReportInput!): String!
  }
`;

module.exports = sharedTypes;
