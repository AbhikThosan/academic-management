require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./src/models/User");
const Student = require("./src/models/Student");
const Course = require("./src/models/Course");
const Faculty = require("./src/models/Faculty");
const connectDB = require("./src/config/db");

const studentNames = [
  "James Smith",
  "Emma Johnson",
  "Liam Brown",
  "Olivia Davis",
  "Noah Wilson",
  "Sophia Moore",
  "Ethan Taylor",
  "Isabella Anderson",
  "Mason Thomas",
  "Ava Jackson",
  "Lucas White",
  "Mia Harris",
  "Alexander Martin",
  "Charlotte Thompson",
  "Henry Garcia",
  "Amelia Martinez",
  "Daniel Lee",
  "Harper Davis",
  "William Clark",
  "Evelyn Lewis",
  "Michael Walker",
  "Emily Hall",
  "Jacob Allen",
  "Abigail Young",
  "Benjamin King",
  "Ella Wright",
  "Samuel Scott",
  "Victoria Green",
  "David Baker",
  "Grace Adams",
  "Joseph Nelson",
  "Chloe Mitchell",
  "John Carter",
  "Lily Perez",
  "Matthew Roberts",
  "Zoe Turner",
  "Andrew Phillips",
  "Hannah Campbell",
  "Christopher Parker",
  "Julia Evans",
  "Ryan Edwards",
  "Madison Collins",
  "Joshua Stewart",
  "Aria Sanchez",
  "Nathan Morris",
  "Layla Rogers",
  "Gabriel Reed",
  "Penelope Cook",
  "Caleb Morgan",
  "Riley Bell",
  "Isaac Bailey",
  "Avery Foster",
  "Dylan Barnes",
  "Samantha Ward",
  "Logan Cox",
  "Natalie Rivera",
  "Owen Brooks",
  "Scarlett Hayes",
  "Elijah Wood",
  "Leah Sanders",
  "Luke Bennett",
  "Hazel James",
  "Aaron Jenkins",
  "Ellie Price",
  "Carter Russell",
  "Addison Howard",
  "Grayson Myers",
  "Lillian Gray",
  "Wyatt Ford",
  "Audrey Hunt",
  "Eli Watson",
  "Skylar Stone",
  "Christian Fox",
  "Brooklyn Dunn",
  "Hunter Porter",
  "Claire Wells",
  "Evan Harper",
  "Paisley Rose",
  "Jaxon Reid",
  "Kylie Fisher",
  "Lincoln Coleman",
  "Aurora Hart",
  "Gavin Dean",
  "Sadie Walsh",
  "Nolan Black",
  "Kayla Sims",
  "Asher Hudson",
  "Violet May",
  "Roman Pierce",
  "Stella Burke",
  "Max Sullivan",
  "Clara Bates",
  "Milo Griffin",
  "Ruby Lane",
  "Finn Berry",
  "Ivy George",
  "Jude Hawkins",
  "Lila Freeman",
  "Ezra Webb",
  "Nova Blair",
];

const facultyNames = [
  "Dr. Robert Thompson",
  "Prof. Susan Miller",
  "Dr. Michael Chen",
  "Prof. Laura Wilson",
  "Dr. David Patel",
];

const courseNames = [
  "Calculus I",
  "Introduction to Physics",
  "Organic Chemistry",
  "Data Structures",
  "Modern Literature",
  "Microeconomics",
  "Linear Algebra",
  "World History",
  "Software Engineering",
  "Biochemistry",
  "Differential Equations",
  "Psychology 101",
  "Operating Systems",
  "Macroeconomics",
  "Quantum Mechanics",
  "English Composition",
  "Database Systems",
  "Environmental Science",
  "Statistics",
  "Artificial Intelligence",
];

const randomFloat = (min, max) => {
  const minCents = Math.round(min * 100);
  const maxCents = Math.round(max * 100);
  const randomCents =
    Math.floor(Math.random() * (maxCents - minCents + 1)) + minCents;
  return randomCents / 100;
};

async function seedDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await connectDB();

    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Faculty.deleteMany({});

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

    const facultyUsers = await User.find({ role: "faculty" });
    const faculty = facultyUsers.map((user, index) => ({
      name: facultyNames[index],
      assignedCourses: [],
    }));
    const facultyDocs = await Faculty.insertMany(faculty);
    console.log("Faculty seeded");

    const students = [];
    for (let i = 0; i < 100; i++) {
      students.push({
        name: studentNames[i % studentNames.length],
        year: faker.number.int({ min: 1, max: 4 }),
        enrolledCourses: [],
        grades: [],
      });
    }
    const studentDocs = await Student.insertMany(students);
    console.log("Students seeded");

    const courses = [];
    for (let i = 0; i < 20; i++) {
      courses.push({
        name: courseNames[i],
        enrolledStudents: [],
        enrollmentCount: 0,
        enrollmentHistory: [
          { timestamp: new Date("2025-04-29T00:00:00Z"), count: 0 },
        ],
      });
    }
    const courseDocs = await Course.insertMany(courses);
    console.log("Courses seeded");

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

    for (let course of courseDocs) {
      const studentCount = faker.number.int({ min: 5, max: 15 });
      const enrolledStudents = faker.helpers.arrayElements(
        studentDocs,
        studentCount
      );
      course.enrolledStudents = enrolledStudents.map((s) => s._id);
      course.enrollmentCount = enrolledStudents.length;
      course.enrollmentHistory = [];

      const startDate = new Date("2025-04-29T00:00:00Z");
      let currentCount = 0;
      for (let i = 0; i <= 30; i += 5) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        if (i < 25) {
          currentCount += faker.number.int({ min: 1, max: 3 });
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
              grade: randomFloat(2.0, 4.0),
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
