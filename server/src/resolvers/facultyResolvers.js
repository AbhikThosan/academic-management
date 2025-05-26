const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const facultyResolvers = {
  Query: {
    getFaculty: async () => await Faculty.find(),
    getFacultyMember: async (_, { id }) => await Faculty.findById(id),
  },
  Mutation: {
    addFaculty: async (_, { name, department }, { user }) => {
      if (!user || user.role !== "admin") throw new Error("Access denied");
      const facultyUser = await User.findOne({ role: "faculty" });
      const faculty = new Faculty({
        userId: facultyUser._id,
        name,
        department,
      });
      await faculty.save();
      return faculty;
    },
    updateFaculty: async (_, { id, name, department }, { user }) => {
      if (!user || user.role !== "admin") throw new Error("Access denied");
      const updateData = {};
      if (name) updateData.name = name;
      if (department) updateData.department = department;
      return await Faculty.findByIdAndUpdate(id, updateData, { new: true });
    },
    deleteFaculty: async (_, { id }, { user }) => {
      if (!user || user.role !== "admin") throw new Error("Access denied");
      await Faculty.findByIdAndDelete(id);
      return true;
    },
    assignGrade: async (_, { studentId, courseId, grade }, { user }) => {
      if (!user || user.role !== "faculty") throw new Error("Access denied");
      const student = await Student.findById(studentId);
      student.grades.push({ courseId, grade });
      await student.save();
      return student;
    },
  },
};

module.exports = facultyResolvers;
