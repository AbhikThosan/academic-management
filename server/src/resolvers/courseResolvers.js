const Course = require("../models/Course");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const { fetchCourseName } = require("../utils/courseUtils");

const courseResolvers = {
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
  Query: {
    courses: async (_, { filter = {}, page = 1, pageSize = 10 }) => {
      let query = {};
      if (filter.search) query.name = { $regex: filter.search, $options: "i" };
      if (filter.facultyId) query.facultyId = filter.facultyId;
      const skip = (page - 1) * pageSize;
      const total = await Course.countDocuments(query);
      const courses = await Course.find(query)
        .sort({ _id: -1 })
        .populate("enrolledStudents")
        .populate("facultyId")
        .skip(skip)
        .limit(pageSize);
      return { courses, total, page, pageSize };
    },
  },
  Mutation: {
    addCourse: async (_, { input }, { user }) => {
      if (!user || !["admin", "faculty"].includes(user.role)) {
        throw new Error("Access denied");
      }
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
  },
};

module.exports = courseResolvers;
