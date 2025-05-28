const Student = require("../models/Student");
const Course = require("../models/Course");
const { fetchCourseName } = require("../utils/courseUtils");

const studentResolvers = {
  Student: {
    gpa: async (parent) => {
      const grades = parent.grades || [];
      return grades.length > 0
        ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
        : 0;
    },
  },
  Query: {
    students: async (_, { filter = {}, page = 1, pageSize = 10 }) => {
      let query = {};
      if (filter.search) query.name = { $regex: filter.search, $options: "i" };
      if (filter.courseId) query.enrolledCourses = filter.courseId;
      if (filter.year) query.year = filter.year;
      const skip = (page - 1) * pageSize;
      const total = await Student.countDocuments(query);
      const students = await Student.find(query)
        .sort({ _id: -1 })
        .populate("enrolledCourses")
        .skip(skip)
        .limit(pageSize);

      return {
        students: await Promise.all(
          students.map(async (student) => ({
            id: student._id.toString(),
            name: student.name,
            year: student.year,
            enrolledCourses: student.enrolledCourses,
            grades: await Promise.all(
              student.grades.map(async (g) => ({
                courseId: g.courseId.toString(),
                courseName: g.courseName || (await fetchCourseName(g.courseId)),
                grade: g.grade,
              }))
            ),
            gpa:
              student.grades.length > 0
                ? student.grades.reduce((sum, g) => sum + g.grade, 0) /
                  student.grades.length
                : 0,
          }))
        ),
        total,
        page,
        pageSize,
      };
    },
    student: async (_, { id }) => {
      const student = await Student.findById(id).populate("enrolledCourses");
      if (!student) return null;

      return {
        id: student._id.toString(),
        name: student.name,
        year: student.year,
        enrolledCourses: student.enrolledCourses,
        grades: await Promise.all(
          student.grades.map(async (g) => ({
            courseId: g.courseId.toString(),
            courseName: g.courseName || (await fetchCourseName(g.courseId)),
            grade: g.grade,
          }))
        ),
        gpa:
          student.grades.length > 0
            ? student.grades.reduce((sum, g) => sum + g.grade, 0) /
              student.grades.length
            : 0,
      };
    },
  },
  Mutation: {
    addStudent: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const student = new Student({
        ...input,
        enrolledCourses: [],
        grades: [],
      });
      await student.save();
      return student;
    },
    updateStudent: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const { id, ...updateData } = input;
      return await Student.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("enrolledCourses");
    },
    deleteStudent: async (_, { id }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      await Student.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = studentResolvers;
