const Course = require("../models/Course");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");

const resolvers = {
  Course: {
    faculty: async (parent) => {
      if (!parent.facultyId) return null;
      return await Faculty.findById(parent.facultyId);
    },
    grades: async (parent) => {
      const students = await Student.find({
        enrolledCourses: parent._id,
      });
      return students
        .flatMap((student) =>
          student.grades
            .filter((g) => g.courseId.toString() === parent._id.toString())
            .map((g) => ({
              courseId: g.courseId.toString(),
              courseName: g.courseName || parent.name,
              grade: g.grade,
            }))
        )
        .filter((g) => g.grade !== undefined);
    },
  },
  Student: {
    gpa: async (parent) => {
      const grades = parent.grades || [];
      return grades.length > 0
        ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
        : 0;
    },
  },
  Query: {
    dashboardSummary: async (_, { limit = 5 }) => {
      const totalStudents = await Student.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalFaculty = await Faculty.countDocuments();
      const students = await Student.find().populate("enrolledCourses");
      const topStudents = students
        .map((student) => {
          const grades = student.grades || [];
          const gpa =
            grades.length > 0
              ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
              : 0;
          return { id: student._id.toString(), name: student.name, gpa };
        })
        .sort((a, b) => b.gpa - a.gpa)
        .slice(0, limit);
      const courses = await Course.find();
      const popularCourses = courses
        .map((course) => ({
          id: course._id.toString(),
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
        .skip(skip)
        .limit(pageSize);

      const courseCache = new Map();
      const fetchCourseName = async (courseId) => {
        if (!courseCache.has(courseId)) {
          const course = await Course.findById(courseId);
          courseCache.set(courseId, course ? course.name : "Unknown Course");
        }
        return courseCache.get(courseId);
      };

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

      const courseCache = new Map();
      const fetchCourseName = async (courseId) => {
        if (!courseCache.has(courseId)) {
          const course = await Course.findById(courseId);
          courseCache.set(courseId, course ? course.name : "Unknown Course");
        }
        return courseCache.get(courseId);
      };

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
          courseId: course._id.toString(),
          courseName: course.name,
          date: entry.timestamp.toISOString(),
          enrollmentCount: entry.count,
        }));
      });
    },
    topStudentsReport: async (_, { filter = {} }) => {
      let students = await Student.find().populate("enrolledCourses");
      if (filter.courseId) {
        students = students.filter((s) =>
          s.enrolledCourses.some((c) => c._id.toString() === filter.courseId)
        );
      }
      const limit = filter.limit || 5;
      return students
        .map((student) => {
          const grades = student.grades.filter(
            (g) => !filter.courseId || g.courseId.toString() === filter.courseId
          );
          const gpa =
            grades.length > 0
              ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
              : 0;
          return {
            id: student._id.toString(),
            name: student.name,
            gpa,
            courseId: filter.courseId,
            courseName: filter.courseId
              ? grades[0]?.courseName || ""
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
    addCourse: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      // Validate facultyId if provided
      if (input.facultyId) {
        const faculty = await Faculty.findById(input.facultyId);
        if (!faculty) {
          throw new Error(`Faculty with ID ${input.facultyId} not found`);
        }
      }
      const course = await Course.create({
        name: input.name,
        facultyId: input.facultyId || null,
        enrolledStudents: [],
        enrollmentCount: 0,
        enrollmentHistory: [{ count: 0 }],
      });
      if (input.facultyId) {
        await Faculty.findByIdAndUpdate(input.facultyId, {
          $addToSet: { assignedCourses: course._id },
        });
      }
      return await Course.findById(course._id)
        .populate("enrolledStudents")
        .populate("facultyId");
    },
    updateCourse: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const { id, facultyId, ...updateData } = input;
      // Validate facultyId if provided
      if (facultyId) {
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) {
          throw new Error(`Faculty with ID ${facultyId} not found`);
        }
      }
      const update = { ...updateData };
      if (facultyId !== undefined) {
        update.facultyId = facultyId || null;
      }
      const course = await Course.findByIdAndUpdate(id, update, {
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
      const faculty = await Faculty.findById(facultyId);
      if (!faculty) {
        throw new Error(`Faculty with ID ${facultyId} not found`);
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
      return await Course.findById(courseId)
        .populate("enrolledStudents")
        .populate("facultyId");
    },
    updateStudentGrade: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
      const { studentId, courseId, grade } = input;
      const student = await Student.findById(studentId);
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      const gradeIndex = student.grades.findIndex(
        (g) => g.courseId.toString() === courseId
      );
      if (gradeIndex >= 0) {
        student.grades[gradeIndex].grade = grade;
        student.grades[gradeIndex].courseName = course.name;
      } else {
        student.grades.push({ courseId, courseName: course.name, grade });
      }
      await student.save();
      return { courseId: courseId.toString(), courseName: course.name, grade };
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
            courseId: course._id.toString(),
            courseName: course.name,
            date: entry.timestamp.toISOString().split("T")[0],
            enrollmentCount: entry.count,
          }));
        });
        const fields = ["courseId", "courseName", "date", "enrollmentCount"];
        const parser = new Parser({ fields });
        return parser.parse(data);
      } else if (type === "topStudents") {
        let students = await Student.find().populate("enrolledCourses");
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
                !filter.courseId || g.courseId.toString() === filter.courseId
            );
            const gpa =
              grades.length > 0
                ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
                : 0;
            return {
              id: student._id.toString(),
              name: student.name,
              gpa,
              courseId: filter.courseId || "",
              courseName: filter.courseId ? grades[0]?.courseName || "" : "",
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
