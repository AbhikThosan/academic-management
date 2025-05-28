const Course = require("../models/Course");

const courseCache = new Map();

const fetchCourseName = async (courseId) => {
  if (!courseCache.has(courseId)) {
    const course = await Course.findById(courseId);
    courseCache.set(courseId, course ? course.name : "Unknown Course");
  }
  return courseCache.get(courseId);
};

module.exports = { fetchCourseName };
