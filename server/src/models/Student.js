const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  grades: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      courseName: {
        type: String,
      },
      grade: {
        type: Number,
        required: true,
      },
    },
  ],
  gpa: {
    type: Number,
    default: 0,
  },
});

StudentSchema.methods.calculateGPA = function () {
  if (!this.grades || this.grades.length === 0) {
    return 0;
  }
  const validGrades = this.grades.filter(
    (g) =>
      typeof g.grade === "number" &&
      !isNaN(g.grade) &&
      g.grade >= 0 &&
      g.grade <= 4
  );
  if (validGrades.length === 0) {
    return 0;
  }
  const total = validGrades.reduce((sum, g) => sum + g.grade, 0);
  return Number((total / validGrades.length).toFixed(2));
};

StudentSchema.pre("save", function (next) {
  this.gpa = this.calculateGPA();
  next();
});

module.exports = mongoose.model("Student", StudentSchema);
