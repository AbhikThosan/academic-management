const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");
const typeDefs = require("./schemas/typeDefs");
const authResolvers = require("./resolvers/authResolvers");
const studentResolvers = require("./resolvers/studentResolvers");
const courseResolvers = require("./resolvers/courseResolvers");
const facultyResolvers = require("./resolvers/facultyResolvers");
const reportResolvers = require("./resolvers/reportResolvers");
const { authMiddleware } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers: [
    authResolvers,
    studentResolvers,
    courseResolvers,
    facultyResolvers,
    reportResolvers,
  ],
  context: ({ req }) => {
    const user = req.user || null;
    return { user };
  },
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(process.env.PORT, () => {
    console.log(
      `Server running on http://localhost:${process.env.PORT}/graphql`
    );
  });
};

startServer();
