const mongoose = require("mongoose");
const User = require("./src/models/User");
const Student = require("./src/models/Student");
const Course = require("./src/models/Course");
const Faculty = require("./src/models/Faculty");
require("dotenv").config();
const bcrypt = require("bcryptjs");

mongoose.connect(process.env.MONGODB_URI);

const generateRandomName = () => {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Chris",
    "Anna",
    "James",
    "Laura",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Wilson",
    "Moore",
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;
};

const generateRandomYear = () => 2020 + Math.floor(Math.random() * 5);
const generateRandomGrade = () => Math.floor(Math.random() * 41) + 60;
const generateRandomDepartment = () =>
  [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Engineering",
    "Biology",
    "Chemistry",
  ][Math.floor(Math.random() * 6)];

const seedData = async () => {
  await User.deleteMany();
  await Student.deleteMany();
  await Course.deleteMany();
  await Faculty.deleteMany();

  console.log("Attempting to create admin user...");
  const adminPasswordHash = await bcrypt.hash("password123", 10);
  console.log("Hashed password for admin:", adminPasswordHash);
  const admin = new User({
    email: "admin@example.com",
    password: adminPasswordHash,
    role: "admin",
  });
  console.log("Admin user before save:", admin);

  await User.collection.insertOne({
    email: "admin@example.com",
    password: adminPasswordHash,
    role: "admin",
  });
  const savedAdmin = await User.findOne({ email: "admin@example.com" });
  console.log("Admin user after save:", savedAdmin);

  const facultyUsers = [];
  for (let i = 0; i < 10; i++) {
    const facultyUserPassword = await bcrypt.hash("password123", 10);
    const facultyUser = await User.collection.insertOne({
      email: `faculty${i}@example.com`,
      password: facultyUserPassword,
      role: "faculty",
    });
    facultyUsers.push(await User.findById(facultyUser.insertedId));
  }

  const faculties = [];
  for (let i = 0; i < 10; i++) {
    const faculty = new Faculty({
      userId: facultyUsers[i]._id,
      name: generateRandomName(),
      department: generateRandomDepartment(),
    });
    await faculty.save();
    faculties.push(faculty);
  }

  const studentUsers = [];
  for (let i = 0; i < 100; i++) {
    const studentUserPassword = await bcrypt.hash("password123", 10);
    const studentUser = await User.collection.insertOne({
      email: `student${i}@example.com`,
      password: studentUserPassword,
      role: "student",
    });
    studentUsers.push(await User.findById(studentUser.insertedId));
  }

  const students = [];
  for (let i = 0; i < 100; i++) {
    const student = new Student({
      userId: studentUsers[i]._id,
      name: generateRandomName(),
      year: generateRandomYear(),
      grades: [],
    });
    await student.save();
    students.push(student);
  }

  const courses = [];
  for (let i = 0; i < 20; i++) {
    const course = new Course({
      name: `Course ${String.fromCharCode(65 + i)}`,
      facultyId: faculties[Math.floor(Math.random() * faculties.length)].userId,
      enrollmentHistory: [{ count: 0 }],
    });
    await course.save();
    courses.push(course);
  }

  for (let i = 0; i < students.length; i++) {
    const numCourses = Math.floor(Math.random() * 5) + 1;
    const assignedCourses = [];
    for (let j = 0; j < numCourses; j++) {
      const course = courses[Math.floor(Math.random() * courses.length)];
      if (!assignedCourses.includes(course._id)) {
        assignedCourses.push(course._id);
        await Course.findByIdAndUpdate(course._id, {
          $push: { enrolledStudents: students[i]._id },
          $inc: { enrollmentCount: 1 },
          $push: { enrollmentHistory: { count: course.enrollmentCount + 1 } },
        });
        await Student.findByIdAndUpdate(students[i]._id, {
          $push: { enrolledCourses: course._id },
          $push: {
            grades: { courseId: course._id, grade: generateRandomGrade() },
          },
        });
      }
    }
  }

  console.log(
    "Database seeded successfully with 100 students, 20 courses, 10 faculty members, and 1 admin"
  );
  mongoose.connection.close();
};

seedData().catch(console.error);
