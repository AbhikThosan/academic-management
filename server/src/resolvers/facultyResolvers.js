const Faculty = require("../models/Faculty");
const Course = require("../models/Course");

const facultyResolvers = {
  Query: {
    facultyMembers: async (_, { page = 1, pageSize = 10 }) => {
      const skip = (page - 1) * pageSize;
      const total = await Faculty.countDocuments();
      const facultyMembers = await Faculty.find()
        .sort({ _id: -1 })
        .populate("assignedCourses")
        .skip(skip)
        .limit(pageSize);
      return { facultyMembers, total, page, pageSize };
    },
  },
  Mutation: {
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
  },
};

module.exports = facultyResolvers;
