const Course = require("../models/Course");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");

const resolvers = {
  Student: {
    gpa: async (parent) => {
      const grades = parent.grades || [];
      return grades.length > 0
        ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
        : 0;
    },
  },
  Course: {
    grades: async (parent) => {
      const students = await Student.find({
        enrolledCourses: parent._id,
      }).populate("grades.courseId");
      return students
        .flatMap((student) =>
          student.grades
            .filter((g) => g.courseId._id.toString() === parent._id.toString())
            .map((g) => ({
              courseId: g.courseId._id,
              courseName: parent.name,
              grade: g.grade,
            }))
        )
        .filter((g) => g.grade !== undefined);
    },
  },
  Query: {
    dashboardSummary: async (_, { limit = 5 }) => {
      const totalStudents = await Student.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalFaculty = await Faculty.countDocuments();
      const students = await Student.find().populate("grades.courseId");
      const topStudents = students
        .map((student) => {
          const grades = student.grades || [];
          const gpa =
            grades.length > 0
              ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
              : 0;
          return { id: student._id, name: student.name, gpa };
        })
        .sort((a, b) => b.gpa - a.gpa)
        .slice(0, limit);
      const courses = await Course.find();
      const popularCourses = courses
        .map((course) => ({
          id: course._id,
          name: course.name,
          enrollmentCount: course.enrollmentCount,
        }))
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, limit);
      return {
        totalStudents,
        totalCourses,
        totalFaculty,
        topStudents,
        popularCourses,
      };
    },
    students: async (_, { filter = {}, page = 1, pageSize = 10 }) => {
      let query = {};
      if (filter.search) query.name = { $regex: filter.search, $options: "i" };
      if (filter.courseId) query.enrolledCourses = filter.courseId;
      if (filter.year) query.year = filter.year;
      const skip = (page - 1) * pageSize;
      const total = await Student.countDocuments(query);
      const students = await Student.find(query)
        .populate("enrolledCourses")
        .populate("grades.courseId")
        .skip(skip)
        .limit(pageSize);
      return { students, total, page, pageSize };
    },
    student: async (_, { id }) =>
      await Student.findById(id)
        .populate("enrolledCourses")
        .populate("grades.courseId"),
    courses: async (_, { filter = {}, page = 1, pageSize = 10 }) => {
      let query = {};
      if (filter.search) query.name = { $regex: filter.search, $options: "i" };
      if (filter.facultyId) query.facultyId = filter.facultyId;
      const skip = (page - 1) * pageSize;
      const total = await Course.countDocuments(query);
      const courses = await Course.find(query)
        .populate("enrolledStudents")
        .populate("facultyId")
        .skip(skip)
        .limit(pageSize);
      return { courses, total, page, pageSize };
    },
    facultyMembers: async (_, { page = 1, pageSize = 10 }) => {
      const skip = (page - 1) * pageSize;
      const total = await Faculty.countDocuments();
      const facultyMembers = await Faculty.find()
        .populate("assignedCourses")
        .skip(skip)
        .limit(pageSize);
      return { facultyMembers, total, page, pageSize };
    },
    courseEnrollmentReport: async (_, { filter = {} }) => {
      let query = {};
      if (filter.courseId) query._id = filter.courseId;
      const courses = await Course.find(query);
      return courses.flatMap((course) => {
        let history = course.enrollmentHistory || [];
        if (filter.startDate || filter.endDate) {
          history = history.filter((entry) => {
            const timestamp = new Date(entry.timestamp);
            const start = filter.startDate
              ? new Date(filter.startDate)
              : new Date(0);
            const end = filter.endDate ? new Date(filter.endDate) : new Date();
            return timestamp >= start && timestamp <= end;
          });
        }
        return history.map((entry) => ({
          courseId: course._id,
          courseName: course.name,
          date: entry.timestamp.toISOString(),
          enrollmentCount: entry.count,
        }));
      });
    },
    topStudentsReport: async (_, { filter = {} }) => {
      let students = await Student.find()
        .populate("enrolledCourses")
        .populate("grades.courseId");
      if (filter.courseId) {
        students = students.filter((s) =>
          s.enrolledCourses.some((c) => c._id.toString() === filter.courseId)
        );
      }
      const limit = filter.limit || 5;
      return students
        .map((student) => {
          const grades = student.grades.filter(
            (g) =>
              !filter.courseId || g.courseId._id.toString() === filter.courseId
          );
          const gpa =
            grades.length > 0
              ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
              : 0;
          return {
            id: student._id,
            name: student.name,
            gpa,
            courseId: filter.courseId,
            courseName: filter.courseId
              ? grades[0]?.courseId?.name || ""
              : undefined,
          };
        })
        .sort((a, b) => b.gpa - a.gpa)
        .slice(0, limit);
    },
  },
  Mutation: {
    register: async (_, { email, password, role }) => {
      if (!["admin", "faculty"].includes(role)) {
        throw new Error("Invalid role. Must be 'admin' or 'faculty'.");
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use.");
      }
      const userDoc = new User({ email, password, role });
      await userDoc.save();
      const token = jwt.sign(
        { id: userDoc._id, role: userDoc.role },
        process.env.JWT_SECRET
      );
      return { token, user: userDoc };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
      );
      return { token, user };
    },
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
      return await Student.findByIdAndUpdate(id, updateData, { new: true })
        .populate("enrolledCourses")
        .populate("grades.courseId");
    },
    deleteStudent: async (_, { id }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      await Student.findByIdAndDelete(id);
      return true;
    },
    addCourse: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const course = new Course({
        ...input,
        enrolledStudents: [],
        enrollmentCount: 0,
        enrollmentHistory: [{ count: 0 }],
      });
      await course.save();
      if (input.facultyId) {
        await Faculty.findByIdAndUpdate(input.facultyId, {
          $push: { assignedCourses: course._id },
        });
      }
      return course;
    },
    updateCourse: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const { id, facultyId, ...updateData } = input;
      const course = await Course.findByIdAndUpdate(id, updateData, {
        new: true,
      })
        .populate("enrolledStudents")
        .populate("facultyId");
      if (facultyId) {
        await Faculty.findByIdAndUpdate(facultyId, {
          $addToSet: { assignedCourses: id },
        });
      }
      return course;
    },
    deleteCourse: async (_, { id }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const course = await Course.findById(id);
      if (course.facultyId) {
        await Faculty.findByIdAndUpdate(course.facultyId, {
          $pull: { assignedCourses: id },
        });
      }
      await Course.findByIdAndDelete(id);
      return true;
    },
    addFaculty: async (_, { input }, { user }) => {
      if (!user || !["admin"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const faculty = new Faculty({ ...input, assignedCourses: [] });
      await faculty.save();
      return faculty;
    },
    updateFaculty: async (_, { input }, { user }) => {
      if (!user || !["admin"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const { id, ...updateData } = input;
      return await Faculty.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("assignedCourses");
    },
    deleteFaculty: async (_, { id }, { user }) => {
      if (!user || !["admin"].includes(user.role)) {
        throw new Error("Access denied");
      }
      await Course.updateMany({ facultyId: id }, { $unset: { facultyId: "" } });
      await Faculty.findByIdAndDelete(id);
      return true;
    },
    assignCourseToFaculty: async (_, { courseId, facultyId }, { user }) => {
      if (!user || !["admin"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const course = await Course.findByIdAndUpdate(
        courseId,
        { facultyId },
        { new: true }
      )
        .populate("enrolledStudents")
        .populate("facultyId");
      await Faculty.findByIdAndUpdate(facultyId, {
        $addToSet: { assignedCourses: courseId },
      });
      return course;
    },
    assignStudentToCourse: async (_, { studentId, courseId }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const course = await Course.findById(courseId);
      if (!course.enrolledStudents.includes(studentId)) {
        course.enrolledStudents.push(studentId);
        course.enrollmentCount += 1;
        course.enrollmentHistory.push({ count: course.enrollmentCount });
        await course.save();
        await Student.findByIdAndUpdate(studentId, {
          $addToSet: { enrolledCourses: courseId },
        });
      }
      return course.populate("enrolledStudents").populate("facultyId");
    },
    updateStudentGrade: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const { studentId, courseId, grade } = input;
      const student = await Student.findById(studentId);
      const gradeIndex = student.grades.findIndex(
        (g) => g.courseId.toString() === courseId
      );
      if (gradeIndex >= 0) {
        student.grades[gradeIndex].grade = grade;
      } else {
        student.grades.push({ courseId, grade });
      }
      await student.save();
      await student.populate("grades.courseId");
      const course = await Course.findById(courseId);
      return { courseId, courseName: course.name, grade };
    },
    exportReport: async (_, { input }) => {
      const { type, filter = {} } = input;
      if (type === "courseEnrollment") {
        let query = {};
        if (filter.courseId) query._id = filter.courseId;
        const courses = await Course.find(query);
        const data = courses.flatMap((course) => {
          let history = course.enrollmentHistory || [];
          if (filter.startDate || filter.endDate) {
            history = history.filter((entry) => {
              const timestamp = new Date(entry.timestamp);
              const start = filter.startDate
                ? new Date(filter.startDate)
                : new Date(0);
              const end = filter.endDate
                ? new Date(filter.endDate)
                : new Date();
              return timestamp >= start && timestamp <= end;
            });
          }
          return history.map((entry) => ({
            courseId: course._id,
            courseName: course.name,
            date: entry.timestamp.toISOString().split("T")[0],
            enrollmentCount: entry.count,
          }));
        });
        const fields = ["courseId", "courseName", "date", "enrollmentCount"];
        const parser = new Parser({ fields });
        return parser.parse(data);
      } else if (type === "topStudents") {
        let students = await Student.find()
          .populate("enrolledCourses")
          .populate("grades.courseId");
        if (filter.courseId) {
          students = students.filter((s) =>
            s.enrolledCourses.some((c) => c._id.toString() === filter.courseId)
          );
        }
        const limit = filter.limit || 5;
        const data = students
          .map((student) => {
            const grades = student.grades.filter(
              (g) =>
                !filter.courseId ||
                g.courseId._id.toString() === filter.courseId
            );
            const gpa =
              grades.length > 0
                ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
                : 0;
            return {
              id: student._id,
              name: student.name,
              gpa,
              courseId: filter.courseId || "",
              courseName: filter.courseId
                ? grades[0]?.courseId?.name || ""
                : "",
            };
          })
          .sort((a, b) => b.gpa - a.gpa)
          .slice(0, limit);
        const fields = ["id", "name", "gpa", "courseId", "courseName"];
        const parser = new Parser({ fields });
        return parser.parse(data);
      }
      throw new Error("Invalid report type");
    },
  },
};

module.exports = resolvers;
