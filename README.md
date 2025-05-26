Academic Management Dashboard Backend
Overview
This is the GraphQL backend for the Academic Management Dashboard, built with Node.js, Express, Apollo Server, and MongoDB. It provides APIs for administrators and faculty to manage students, courses, faculty, grades, and reports.
Features

Authentication: JWT-based registration and login for admin and faculty roles. Anyone can register as an admin or faculty member.
Student Management: Add, update, delete, and assign students to courses (admin and faculty).
Course Management: Add, update, delete, and assign courses to faculty (admin only) or students (admin and faculty).
Faculty Management: Add, update, delete faculty (admin only).
Grade Management: Add/update student grades (admin and faculty).
Reporting: Dashboard summary, course enrollment trends over time, top students reports, and CSV export.

Setup Instructions

Clone the Repository:
git clone <repository-url>
cd academic-dashboard-backend

Install Dependencies:
npm install

Configure Environment Variables:Create a .env file in the root directory with:
MONGODB_URI=mongodb://localhost:27017/academic_dashboard
JWT_SECRET=your_jwt_secret_here
PORT=4000

Run MongoDB:Ensure MongoDB is running locally or provide a valid MONGODB_URI.

Seed the Database:Populate the database with demo data:
npm run seed

This creates 2 admins, 5 faculty, 100 students, 20 courses, and sample enrollment/grade data.

Start the Server:
npm start

The server will run at http://localhost:4000/graphql.

API Endpoints

GraphQL Endpoint: /graphql
Queries:
dashboardSummary: Get total counts, top students, and popular courses.
students: Paginated student list with filters.
student: Get a student’s profile.
courses: Paginated course list with filters.
facultyMembers: Paginated faculty list.
courseEnrollmentReport: Course enrollment trends over time (filter by course and date range).
topStudentsReport: Top students by course or institute.

Mutations:
register: Register a new admin or faculty user (open to anyone).
login: Authenticate admin or faculty.
addStudent, updateStudent, deleteStudent: Manage students (admin, faculty).
addCourse, updateCourse, deleteCourse: Manage courses (admin, faculty).
addFaculty, updateFaculty, deleteFaculty: Manage faculty (admin only).
assignCourseToFaculty: Assign course to faculty (admin only).
assignStudentToCourse: Enroll student in course (admin, faculty).
updateStudentGrade: Add/update student grade (admin, faculty).
exportReport: Export course enrollment or top students as CSV.

Role-Based Access

Admin: Full access to all mutations and queries, including faculty management and course-to-faculty assignment.
Faculty: Access to student/course management and grade updates, but not faculty management or course-to-faculty assignment.
Registration: Open to anyone to register as admin or faculty, suitable for demonstration purposes.

Dependencies

Node.js
MongoDB
Apollo Server, Express, Mongoose
bcryptjs, jsonwebtoken, json2csv, @faker-js/faker
