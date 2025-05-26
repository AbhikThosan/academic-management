const Course = require("../models/Course");
const Student = require("../models/Student");

const courseResolvers = {
  Query: {
    getCourses: async (_, { page, limit, search, facultyId }) => {
      let query = {};

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      if (facultyId) {
        query.facultyId = facultyId;
      }

      const pageNum = page || 1;
      const pageSize = limit || 10;
      const skip = (pageNum - 1) * pageSize;

      return await Course.find(query)
        .populate("enrolledStudents")
        .skip(skip)
        .limit(pageSize);
    },
    getCourse: async (_, { id }) =>
      await Course.findById(id).populate("enrolledStudents"),
  },
  Mutation: {
    addCourse: async (_, { name, facultyId }) => {
      const course = new Course({
        name,
        facultyId,
        enrollmentHistory: [{ count: 0 }],
      });
      await course.save();
      return course;
    },
    updateCourse: async (_, { id, name, facultyId }) => {
      return await Course.findByIdAndUpdate(
        id,
        { name, facultyId },
        { new: true }
      );
    },
    deleteCourse: async (_, { id }) => {
      await Course.findByIdAndDelete(id);
      return true;
    },
    assignStudentToCourse: async (_, { studentId, courseId }) => {
      const course = await Course.findById(courseId);
      course.enrolledStudents.push(studentId);
      course.enrollmentCount += 1;
      course.enrollmentHistory.push({ count: course.enrollmentCount });
      await course.save();
      return course;
    },
  },
};

module.exports = courseResolvers;
