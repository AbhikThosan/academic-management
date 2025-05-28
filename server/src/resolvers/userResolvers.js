const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userResolvers = {
  Mutation: {
    register: async (_, { email, password, role }) => {
      try {
        if (!email || !password || !role) {
          throw new Error("Email, password, and role are required");
        }
        if (!["admin", "faculty"].includes(role)) {
          throw new Error("Invalid role. Must be 'admin' or 'faculty'");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
          email,
          password: hashedPassword,
          role,
        });

        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || "your_jwt_secret",
          { expiresIn: "1d" }
        );

        return {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          },
        };
      } catch (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
    },
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || "your_jwt_secret",
          { expiresIn: "1d" }
        );

        return {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          },
        };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
  },
};

module.exports = userResolvers;
