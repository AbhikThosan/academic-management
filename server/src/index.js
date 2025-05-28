require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

const courseSchema = require("./schemas/courseSchema");
const facultySchema = require("./schemas/facultySchema");
const studentSchema = require("./schemas/studentSchema");
const userSchema = require("./schemas/userSchema");
const sharedTypes = require("./schemas/sharedTypes");
const courseResolvers = require("./resolvers/courseResolvers");
const facultyResolvers = require("./resolvers/facultyResolvers");
const studentResolvers = require("./resolvers/studentResolvers");
const reportResolvers = require("./resolvers/reportResolvers");
const userResolvers = require("./resolvers/userResolvers");

const startServer = async () => {
  try {
    await connectDB();
    const typeDefs = mergeTypeDefs([
      courseSchema,
      facultySchema,
      studentSchema,
      userSchema,
      sharedTypes,
    ]);
    const resolvers = mergeResolvers([
      courseResolvers,
      facultyResolvers,
      studentResolvers,
      reportResolvers,
      userResolvers,
    ]);

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json());

    const server = new ApolloServer({
      schema,
      context: ({ req }) => {
        const token = req.headers.authorization?.replace("Bearer ", "") || "";
        let user = null;
        if (token) {
          try {
            user = jwt.verify(
              token,
              process.env.JWT_SECRET || "your_jwt_secret"
            );
          } catch (error) {
            console.error("JWT verification failed:", error.message);
          }
        }
        return { user };
      },
      formatError: (err) => {
        console.error("GraphQL Error:", err);
        return err;
      },
    });

    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}${server.graphqlPath}`
      );
    });

    console.log("Merged Schema:", typeDefs);
  } catch (error) {
    console.error("Server startup failed:", error);
  }
};

startServer();
