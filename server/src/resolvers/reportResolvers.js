const Student = require("../models/Student");
const Course = require("../models/Course");
const Faculty = require("../models/Faculty");
const { fetchCourseName } = require("../utils/courseUtils");
const { Parser } = require("json2csv");

const reportResolvers = {
  Query: {
    dashboardSummary: async (_, { limit = 5 }) => {
      try {
        const totalStudents = await Student.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalFaculty = await Faculty.countDocuments();

        const topStudents = await Student.find()
          .sort({ gpa: -1 })
          .limit(limit)
          .exec();

        const popularCourses = await Course.find()
          .sort({ enrollmentCount: -1 })
          .limit(limit)
          .exec();

        return {
          totalStudents,
          totalCourses,
          totalFaculty,
          topStudents: topStudents.map((student) => ({
            id: student._id.toString(),
            name: student.name,
            gpa: student.gpa,
            courseId: null,
            courseName: null,
          })),
          popularCourses: popularCourses.map((course) => ({
            id: course._id.toString(),
            name: course.name,
            enrollmentCount: course.enrollmentCount,
          })),
        };
      } catch (error) {
        throw new Error(`Failed to fetch dashboard summary: ${error.message}`);
      }
    },
    courseEnrollmentReport: async (_, { filter = {} }) => {
      try {
        let query = {};
        if (filter.courseId) query._id = filter.courseId;
        const courses = await Course.find(query).sort({ _id: -1 });
        let report = [];
        for (const course of courses) {
          const history = course.enrollmentHistory
            .filter((entry) => {
              if (
                filter.startDate &&
                entry.timestamp < new Date(filter.startDate)
              )
                return false;
              if (filter.endDate && entry.timestamp > new Date(filter.endDate))
                return false;
              return true;
            })
            .map((entry) => ({
              courseId: course._id.toString(),
              courseName: course.name,
              date: entry.timestamp.toISOString(),
              enrollmentCount: entry.count,
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          report = report.concat(history);
        }
        return report;
      } catch (error) {
        throw new Error(`Failed to fetch enrollment report: ${error.message}`);
      }
    },
    topStudentsReport: async (_, { filter = {} }) => {
      try {
        let query = {};
        if (filter.courseId) {
          query.grades = { $elemMatch: { courseId: filter.courseId } };
        }
        const students = await Student.find(query)
          .sort({ gpa: -1 })
          .limit(filter.limit || 10)
          .exec();
        return await Promise.all(
          students.map(async (student) => {
            let courseId = null;
            let courseName = null;
            if (filter.courseId) {
              const grade = student.grades.find(
                (g) => g.courseId.toString() === filter.courseId
              );
              courseId = grade?.courseId?.toString();
              courseName = await fetchCourseName(grade?.courseId);
            }
            return {
              id: student._id.toString(),
              name: student.name,
              gpa: student.gpa,
              courseId,
              courseName,
            };
          })
        );
      } catch (error) {
        throw new Error(
          `Failed to fetch top students report: ${error.message}`
        );
      }
    },
  },
  Mutation: {
    exportReport: async (_, { input }, { user }) => {
      try {
        if (!user || user.role !== "admin") {
          throw new Error("Access denied");
        }
        let data = [];
        if (input.type === "students") {
          let query = {};
          if (input.filter?.courseId) {
            query.enrolledCourses = input.filter.courseId;
          }
          if (input.filter?.year) query.year = input.filter.year;
          if (input.filter?.search)
            query.name = { $regex: input.filter.search, $options: "i" };
          const students = await Student.find(query)
            .sort({ _id: -1 })
            .limit(input.filter?.limit || 100)
            .exec();
          data = await Promise.all(
            students.map(async (student) => ({
              id: student._id.toString(),
              name: student.name,
              year: student.year,
              gpa: student.gpa,
              enrolledCourses: await Promise.all(
                student.enrolledCourses.map((courseId) =>
                  fetchCourseName(courseId)
                )
              ),
            }))
          );
        } else if (input.type === "courses") {
          let query = {};
          if (input.filter?.facultyId) query.facultyId = input.filter.facultyId;
          if (input.filter?.search)
            query.name = { $regex: input.filter.search, $options: "i" };
          const courses = await Course.find(query)
            .sort({ _id: -1 })
            .limit(input.filter?.limit || 100)
            .exec();
          data = await Promise.all(
            courses.map(async (course) => ({
              id: course._id.toString(),
              name: course.name,
              enrollmentCount: course.enrollmentCount,
              faculty: course.facultyId
                ? (
                    await Faculty.findById(course.facultyId)
                  )?.name
                : null,
            }))
          );
        } else {
          throw new Error("Invalid report type");
        }
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);
        return csv;
      } catch (error) {
        throw new Error(`Failed to export report: ${error.message}`);
      }
    },
  },
};

module.exports = reportResolvers;
