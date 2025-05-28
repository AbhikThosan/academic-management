require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Student = require("./src/models/Student");
const Course = require("./src/models/Course");
const Faculty = require("./src/models/Faculty");
const connectDB = require("./src/config/db");

const adminUsers = [
  {
    email: "admin.johnson@university.edu",
    password: "admin123",
    role: "admin",
  },
  {
    email: "admin.williams@university.edu",
    password: "admin123",
    role: "admin",
  },
];

const facultyData = [
  {
    name: "Dr. John Chen, Mathematics",
    email: "jchen@university.edu",
    password: "faculty123",
    role: "faculty",
  },
  {
    name: "Prof. Maria Gonzalez, Computer Science",
    email: "mgonzalez@university.edu",
    password: "faculty123",
    role: "faculty",
  },
  {
    name: "Dr. Aisha Khan, Physics",
    email: "akhan@university.edu",
    password: "faculty123",
    role: "faculty",
  },
  {
    name: "Prof. Robert Taylor, History",
    email: "rtaylor@university.edu",
    password: "faculty123",
    role: "faculty",
  },
  {
    name: "Dr. Priya Patel, Biology",
    email: "ppatel@university.edu",
    password: "faculty123",
    role: "faculty",
  },
];

const courseData = [
  "Calculus I",
  "Calculus II",
  "Linear Algebra",
  "Statistics",
  "Introduction to Computer Science",
  "Data Structures",
  "Software Engineering",
  "Database Systems",
  "Artificial Intelligence",
  "General Physics I",
  "General Physics II",
  "Quantum Mechanics",
  "World History",
  "American History",
  "Modern European History",
  "General Biology",
  "Molecular Biology",
  "Ecology",
  "Microeconomics",
  "Macroeconomics",
  "English Literature",
  "Creative Writing",
  "Introduction to Psychology",
];

const studentNames = [
  "Wei Li",
  "Maria Gonzalez",
  "James Kim",
  "Aisha Rahman",
  "Carlos Martinez",
  "Sophie Nguyen",
  "Ahmed Hassan",
  "Emma Brown",
  "Liam O’Connor",
  "Priya Sharma",
  "Juan Lopez",
  "Fatima Ali",
  "Michael Chen",
  "Isabella Davis",
  "Raj Patel",
  "Elena Rodriguez",
  "David Lee",
  "Anika Gupta",
  "Lucas Silva",
  "Zara Khan",
  "Noah Wilson",
  "Layla Jackson",
  "Hiro Tanaka",
  "Olivia Smith",
  "Arjun Mehta",
  "Sofia Perez",
  "Ethan Taylor",
  "Amara Diallo",
  "Jacob White",
  "Mia Clark",
  "Omar Farooq",
  "Chloe Adams",
  "Ravi Kumar",
  "Lily Tran",
  "Gabriel Costa",
  "Nia Harris",
  "Samuel Green",
  "Aria Thomas",
  "Vikram Singh",
  "Ella Moore",
  "Mateo Rivera",
  "Leila Hosseini",
  "Daniel Park",
  "Ava Lewis",
  "Santiago Cruz",
  "Zoe Carter",
  "Elijah Brooks",
  "Maya Johnson",
  "Haruto Yamada",
  "Clara Evans",
  "Amir Khan",
  "Harper Scott",
  "Luca Bianchi",
  "Nora Hall",
  "Aiden Young",
  "Lila Wong",
  "Finn Murphy",
  "Sana Iqbal",
  "Caleb Walker",
  "Ruby Phillips",
  "Diego Morales",
  "Freya Nelson",
  "Khalil Brown",
  "Ivy Turner",
  "Hugo Silva",
  "Mira Patel",
  "Owen Hughes",
  "Esme Gray",
  "Malik Jones",
  "Stella Kim",
  "Jasper Reed",
  "Amina Yusuf",
  "Theo Bennett",
  "Violet Fisher",
  "Omar Garcia",
  "Hazel Sullivan",
  "Eli Porter",
  "Luna Ortiz",
  "Maxwell Ross",
  "Saanvi Desai",
  "Grayson Perry",
  "Nadia Salem",
  "Micah Ford",
  "Clara Ellis",
  "Roman Berry",
  "Jade Nguyen",
  "Asher Wells",
  "Nova Pierce",
  "Finn Kelly",
  "Zainab Omar",
  "Wyatt Fox",
  "Delilah Stone",
  "Jude Gordon",
  "Mila Baker",
  "Evan Murphy",
  "Savannah Collins",
  "Dylan Reed",
  "Audrey Morgan",
  "Tristan Long",
  "Kayla Price",
];

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

    const users = [...adminUsers, ...facultyData].map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }));
    const userDocs = await User.insertMany(users);
    console.log("Users seeded");

    const facultyUsers = await User.find({ role: "faculty" });
    const faculty = facultyUsers.map((user) => ({
      name: facultyData.find((f) => f.email === user.email).name,
      assignedCourses: [],
    }));
    const facultyDocs = await Faculty.insertMany(faculty);
    console.log("Faculty seeded");

    const courses = courseData.map((name) => ({
      name,
      enrolledStudents: [],
      enrollmentCount: 0,
      enrollmentHistory: [
        { timestamp: new Date("2025-04-01T00:00:00Z"), count: 0 },
      ],
    }));
    const courseDocs = await Course.insertMany(courses);
    console.log("Courses seeded");

    const students = studentNames.map((name, i) => ({
      name,
      year: Math.floor(i / 25) + 1,
      enrolledCourses: [],
      grades: [],
      gpa: 0,
    }));
    const studentDocs = await Student.insertMany(students);
    console.log("Students seeded");

    const courseAssignments = [
      [0, 1, 2], // Dr. Chen: Calculus I, II, Linear Algebra
      [4, 5, 6, 8], // Prof. Gonzalez: CS courses, AI
      [9, 10, 11], // Dr. Khan: Physics
      [12, 13, 14], // Prof. Taylor: History
      [15, 16, 17, 22], // Dr. Patel: Biology, Psychology
    ];
    for (let i = 0; i < facultyDocs.length; i++) {
      const faculty = facultyDocs[i];
      const assignedCourses = courseAssignments[i].map(
        (index) => courseDocs[index]._id
      );
      faculty.assignedCourses = assignedCourses;
      await Faculty.findByIdAndUpdate(faculty._id, {
        assignedCourses: faculty.assignedCourses,
      });
      for (let courseId of assignedCourses) {
        await Course.findByIdAndUpdate(courseId, { facultyId: faculty._id });
      }
    }
    console.log("Courses assigned to faculty");

    for (let course of courseDocs) {
      const maxStudents =
        course.name.includes("Introduction") || course.name.includes("I")
          ? 20
          : 12;
      const studentCount =
        Math.floor(Math.random() * (maxStudents - 5 + 1)) + 5;
      const enrolledStudents = studentDocs
        .sort(() => Math.random() - 0.5)
        .slice(0, studentCount);

      course.enrolledStudents = enrolledStudents.map((s) => s._id);
      course.enrollmentCount = enrolledStudents.length;
      course.enrollmentHistory = [];

      const startDate = new Date("2025-04-01T00:00:00Z");
      let currentCount = 0;
      for (let i = 0; i <= 30; i += 3) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        if (i <= 24) {
          currentCount += Math.floor(Math.random() * 3);
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
        const studentDoc = await Student.findById(student._id);
        const rand = Math.random();
        let gradeValue;
        if (rand < 0.1) gradeValue = 4.0;
        else if (rand < 0.3) gradeValue = 3.5 + Math.random() * 0.4;
        else if (rand < 0.7) gradeValue = 3.0 + Math.random() * 0.4;
        else if (rand < 0.9) gradeValue = 2.0 + Math.random() * 0.9;
        else gradeValue = Math.random() * 2.0;
        gradeValue = Number(gradeValue.toFixed(2));

        studentDoc.enrolledCourses.push(course._id);
        studentDoc.grades.push({
          courseId: course._id,
          courseName: course.name,
          grade: gradeValue,
        });
        await studentDoc.save();
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
