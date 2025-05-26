const Student = require("../models/Student");
const Course = require("../models/Course");

const studentResolvers = {
  Query: {
    getStudents: async (_, { page, limit, search, year, courseId }) => {
      let query = {};

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      if (year) {
        query.year = year;
      }

      if (courseId) {
        query.enrolledCourses = courseId;
      }

      const pageNum = page || 1;
      const pageSize = limit || 10;
      const skip = (pageNum - 1) * pageSize;

      return await Student.find(query)
        .populate("enrolledCourses")
        .skip(skip)
        .limit(pageSize);
    },
    getStudent: async (_, { id }) =>
      await Student.findById(id).populate("enrolledCourses"),
    getTopStudents: async (_, { limit }) => {
      const students = await Student.find().populate("enrolledCourses");
      const studentsWithGPA = students.map((student) => {
        const grades = student.grades || [];
        const totalGrades = grades.reduce((sum, grade) => sum + grade.grade, 0);
        const gpa = grades.length > 0 ? totalGrades / grades.length : 0;
        return {
          id: student._id,
          name: student.name,
          gpa,
        };
      });
      return studentsWithGPA.sort((a, b) => b.gpa - a.gpa).slice(0, limit);
    },
  },
  Mutation: {
    addStudent: async (_, { name, year }) => {
      const user = await User.findOne({ role: "student" });
      const student = new Student({ userId: user._id, name, year, grades: [] });
      await student.save();
      return student;
    },
    updateStudent: async (_, { id, name, year }) => {
      return await Student.findByIdAndUpdate(id, { name, year }, { new: true });
    },
    deleteStudent: async (_, { id }) => {
      await Student.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = studentResolvers;
