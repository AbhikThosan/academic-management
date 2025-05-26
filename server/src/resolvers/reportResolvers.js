const Course = require("../models/Course");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const reportResolvers = {
  Query: {
    getEnrollmentTrends: async (_, { courseId, startDate, endDate }) => {
      let query = {};
      if (courseId) {
        query._id = courseId;
      }

      const course = await Course.findOne(query);
      if (!course) throw new Error("Course not found");

      let history = course.enrollmentHistory || [];
      if (startDate || endDate) {
        history = history.filter((entry) => {
          const timestamp = new Date(entry.timestamp);
          const start = startDate ? new Date(startDate) : new Date(0);
          const end = endDate ? new Date(endDate) : new Date();
          return timestamp >= start && timestamp <= end;
        });
      }

      return history;
    },
    getTopStudentsByCourse: async (_, { courseId, limit }) => {
      const students = await Student.find({
        enrolledCourses: courseId,
      }).populate("enrolledCourses");
      const studentsWithGPA = students.map((student) => {
        const grades = student.grades || [];
        const courseGrade = grades.find(
          (grade) => grade.courseId.toString() === courseId.toString()
        );
        const gpa = courseGrade ? courseGrade.grade : 0;
        return {
          id: student._id,
          name: student.name,
          gpa,
        };
      });
      return studentsWithGPA.sort((a, b) => b.gpa - a.gpa).slice(0, limit);
    },
    getTopStudentsByInstitute: async (_, { department, limit }) => {
      let students = await Student.find().populate("enrolledCourses");
      if (department) {
        const faculty = await Faculty.find({ department });
        const facultyIds = faculty.map((f) => f.userId.toString());
        const courses = await Course.find({ facultyId: { $in: facultyIds } });
        const courseIds = courses.map((c) => c._id.toString());
        students = students.filter((student) =>
          student.enrolledCourses.some((course) =>
            courseIds.includes(course._id.toString())
          )
        );
      }
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
    getSummary: async () => {
      const totalStudents = await Student.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalFaculty = await Faculty.countDocuments();
      return { totalStudents, totalCourses, totalFaculty };
    },
  },
};

module.exports = reportResolvers;
