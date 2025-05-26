const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authResolvers = {
  Mutation: {
    login: async (_, { email, password }) => {
      console.log("Login attempt for email:", email);
      const user = await User.findOne({ email });
      console.log("User found in database:", user);
      if (!user) {
        console.log("No user found with email:", email);
        throw new Error("Invalid credentials");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password comparison result:", isMatch);
      if (!isMatch) {
        console.log(
          "Password mismatch for user:",
          user.email,
          "Provided:",
          password,
          "Stored hash:",
          user.password
        );
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
      );
      return { token, user };
    },
    register: async (_, { email, password, role }) => {
      const user = new User({ email, password, role });
      await user.save();
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET
      );
      return { token, user };
    },
  },
  Query: {
    me: (_, __, { user }) => user,
  },
};

module.exports = authResolvers;
