require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./src/models/User");
const Student = require("./src/models/Student");
const Course = require("./src/models/Course");
const Faculty = require("./src/models/Faculty");
const connectDB = require("./src/config/db");

async function seedDB() {
  try {
    // Validate MONGODB_URI
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Faculty.deleteMany({});

    // Seed Users (2 admins, 5 faculty)
    const users = [];
    for (let i = 0; i < 2; i++) {
      users.push({
        email: `admin${i + 1}@example.com`,
        password: "admin123",
        role: "admin",
      });
    }
    for (let i = 0; i < 5; i++) {
      users.push({
        email: `faculty${i + 1}@example.com`,
        password: "faculty123",
        role: "faculty",
      });
    }
    await User.insertMany(users);
    console.log("Users seeded");

    // Seed Faculty
    const facultyUsers = await User.find({ role: "faculty" });
    const faculty = facultyUsers.map((user, index) => ({
      name: faker.person.fullName(),
      assignedCourses: [],
    }));
    const facultyDocs = await Faculty.insertMany(faculty);
    console.log("Faculty seeded");

    // Seed Students
    const students = [];
    for (let i = 0; i < 100; i++) {
      students.push({
        name: faker.person.fullName(),
        year: faker.number.int({ min: 1, max: 4 }),
        enrolledCourses: [],
        grades: [],
      });
    }
    const studentDocs = await Student.insertMany(students);
    console.log("Students seeded");

    // Seed Courses
    const courses = [];
    for (let i = 0; i < 20; i++) {
      courses.push({
        name: faker.lorem.words(3),
        enrolledStudents: [],
        enrollmentCount: 0,
        enrollmentHistory: [
          { timestamp: new Date("2025-04-01T00:00:00Z"), count: 0 },
        ],
      });
    }
    const courseDocs = await Course.insertMany(courses);
    console.log("Courses seeded");

    // Assign Courses to Faculty
    for (let faculty of facultyDocs) {
      const courseCount = faker.number.int({ min: 2, max: 3 });
      const assignedCourses = faker.helpers.arrayElements(
        courseDocs,
        courseCount
      );
      faculty.assignedCourses = assignedCourses.map((c) => c._id);
      await Faculty.findByIdAndUpdate(faculty._id, {
        assignedCourses: faculty.assignedCourses,
      });
      for (let course of assignedCourses) {
        await Course.findByIdAndUpdate(course._id, { facultyId: faculty._id });
      }
    }
    console.log("Courses assigned to faculty");

    // Enroll Students in Courses and Assign Grades
    for (let course of courseDocs) {
      const studentCount = faker.number.int({ min: 5, max: 15 });
      const enrolledStudents = faker.helpers.arrayElements(
        studentDocs,
        studentCount
      );
      course.enrolledStudents = enrolledStudents.map((s) => s._id);
      course.enrollmentCount = enrolledStudents.length;
      course.enrollmentHistory = [];

      // Simulate enrollment history over 30 days (April 1 - April 30, 2025)
      const startDate = new Date("2025-04-01T00:00:00Z");
      let currentCount = 0;
      for (let i = 0; i < 30; i += 5) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        if (i < 25) {
          currentCount += faker.number.int({ min: 0, max: 3 });
          if (currentCount > enrolledStudents.length)
            currentCount = enrolledStudents.length;
        }
        course.enrollmentHistory.push({ timestamp: date, count: currentCount });
      }
      await Course.findByIdAndUpdate(course._id, {
        enrolledStudents: course.enrolledStudents,
        enrollmentCount: course.enrollmentCount,
        enrollmentHistory: course.enrollmentHistory,
      });

      for (let student of enrolledStudents) {
        await Student.findByIdAndUpdate(student._id, {
          $addToSet: { enrolledCourses: course._id },
          $push: {
            grades: {
              courseId: course._id,
              grade: faker.number.int({ min: 0, max: 100 }),
            },
          },
        });
      }
    }
    console.log("Students enrolled and grades assigned");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDB();
