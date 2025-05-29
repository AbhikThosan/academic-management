# Academic Management System

A comprehensive web application for managing academic institutions, built with Next.js, GraphQL, and MongoDB.

## Features

- **Dashboard**

  - Overview of key metrics
  - Course enrollment statistics
  - Top performing students
  - Interactive charts and reports

- **Student Management**

  - Add, edit, and delete student records
  - Track student performance
  - View student enrollment history
  - GPA calculation and tracking

- **Course Management**

  - Create and manage courses
  - Assign faculty to courses
  - Track course enrollments
  - Course performance analytics

- **Faculty Management**

  - Add/update student grades for courses
  - Assign students to courses

- **Reports**
  - Course enrollment reports
  - Student performance reports
  - Custom date range filtering
  - Export data to CSV

## Tech Stack

### Frontend

- Next.js 15
- TypeScript
- Apollo Client
- Redux Toolkit
- Ant Design
- Tailwind CSS
- React Hot Toast

### Backend

- Node.js
- Express
- GraphQL
- MongoDB
- Mongoose
- JWT Authentication

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/AbhikThosan/academic-management.git
cd academic-management
```

2. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:

Create `.env` files in both client and server directories:

**Client (.env)**

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_APP_NAME=Academic Management
```

**Server (.env)**

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/academic-management
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:

```bash
# Seed demo data
cd server
node seed.js
# Start server
npm run dev

# Start client (in a new terminal)
cd client
npm run dev
```

The application will be available at:

- Client: http://localhost:3000

## Project Structure

```
academic-management/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static files
│
└── server/                # Backend application
    ├── src/
    │   ├── config/       # Configuration files
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Mongoose models
    │   ├── resolvers/    # GraphQL resolvers
    │   ├── schemas/      # GraphQL schemas
    │   └── utils/        # Utility functions
    └── tests/            # Test files
```
