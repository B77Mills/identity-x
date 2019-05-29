const gql = require('graphql-tag');

module.exports = gql`

extend type Mutation {
  createOrganization(input: CreateOrganizationMutationInput!): Organization! @requiresAuth
  setOrganizationName(input: SetOrganizationNameMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
}

type Organization {
  id: String!
  name: String!
  description: String
}

input CreateOrganizationMutationInput {
  name: String!
}

input SetOrganizationNameMutationInput {
  id: String!
  value: String!
}

`;
