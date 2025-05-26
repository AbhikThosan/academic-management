const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");
const typeDefs = require("./schemas/typeDefs");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    let user = null;
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        console.error("Token verification failed:", error.message);
      }
    }
    return { user };
  },
  formatError: (err) => {
    console.error("GraphQL Error:", {
      message: err.message,
      locations: err.locations,
      path: err.path,
      extensions: err.extensions,
    });
    return err;
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
