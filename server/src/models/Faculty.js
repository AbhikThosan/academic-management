const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  assignedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

module.exports = mongoose.model("Faculty", FacultySchema);
