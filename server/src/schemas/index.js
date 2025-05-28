const { mergeTypeDefs } = require("@graphql-tools/merge");
const sharedTypes = require("./sharedTypes");
const facultySchema = require("./facultySchema");
const courseSchema = require("./courseSchema");
const studentSchema = require("./studentSchema");
const userSchema = require("./userSchema");

module.exports = mergeTypeDefs([
  sharedTypes,
  facultySchema,
  courseSchema,
  studentSchema,
  userSchema,
]);
