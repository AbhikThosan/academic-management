const { gql } = require("apollo-server-express");

const userSchema = gql`
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Mutation {
    register(email: String!, password: String!, role: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

module.exports = userSchema;
