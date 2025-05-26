const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  enrollmentCount: { type: Number, default: 0 },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  enrollmentHistory: [
    { timestamp: { type: Date, default: Date.now }, count: Number },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
