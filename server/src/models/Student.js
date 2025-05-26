const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  grades: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      grade: Number,
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
