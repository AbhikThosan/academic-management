const { mergeResolvers } = require("@graphql-tools/merge");
const userResolvers = require("./userResolvers");
const studentResolvers = require("./studentResolvers");
const courseResolvers = require("./courseResolvers");
const facultyResolvers = require("./facultyResolvers");
const reportResolvers = require("./reportResolvers");

module.exports = mergeResolvers([
  userResolvers,
  studentResolvers,
  courseResolvers,
  facultyResolvers,
  reportResolvers,
]);
