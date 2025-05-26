const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  enrollmentCount: { type: Number, default: 0 },
  enrollmentHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      count: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
