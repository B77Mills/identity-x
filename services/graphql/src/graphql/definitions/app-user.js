const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  appUsers(input: AppUsersQueryInput!): AppUserConnection! @requiresAppRole
  appUser(input: AppUserQueryInput = {}): AppUser @requiresApp # must be public
  activeAppUser: AppUser @requiresAuth(type: AppUser)
  activeAppContext: AppContext! @requiresApp # must be public
  checkContentAccess(input: CheckContentAccessQueryInput!): AppContentAccess! @requiresApp # must be public
  matchAppUsers(input: MatchAppUsersQueryInput!): AppUserConnection! @requiresAppRole
}

extend type Mutation {
  createAppUser(input: CreateAppUserMutationInput!): AppUser! @requiresApp # must be public
  exportAppUsers: String! @requiresAppRole
  manageCreateAppUser(input: ManageCreateAppUserMutationInput!): AppUser! @requiresAppRole(roles: [Owner, Administrator, Member])
  updateAppUser(input: UpdateAppUserMutationInput!): AppUser! @requiresAppRole(roles: [Owner, Administrator, Member])
  updateOwnAppUser(input: UpdateOwnAppUserMutationInput!): AppUser! @requiresAuth(type: AppUser)
  sendAppUserLoginLink(input: SendAppUserLoginLinkMutationInput!): String @requiresApp # must be public
  loginAppUser(input: LoginAppUserMutationInput!): AppUserAuthentication! @requiresApp # must be public
  logoutAppUser(input: LogoutAppUserMutationInput!): String! @requiresApp # must be public
  logoutAppUserWithData(input: LogoutAppUserWithDataMutationInput!): AppUser @requiresApp # must be public

  setAppUserBanned(input: SetAppUserBannedMutationInput!): AppUser! @requiresAppRole(roles: [Owner, Administrator, Member])
  setAppUserRegionalConsent(input: SetAppUserRegionalConsentMutationInput!): AppUser! @requiresAuth(type: AppUser) # can only be set by self

  updateAppUserCustomSelectAnswers(input: UpdateAppUserCustomSelectAnswersMutationInput!): AppUser! @requiresAppRole(roles: [Owner, Administrator, Member])
  updateOwnAppUserCustomSelectAnswers(input: UpdateOwnAppUserCustomSelectAnswersMutationInput!): AppUser! @requiresAuth(type: AppUser)

  "Sets field data to an unverified app user only. Is used for collecting user info before a login link is sent/used."
  setAppUserUnverifiedData(input: SetAppUserUnverifiedDataMutationInput!): AppUser! @requiresApp # must be public
  "Adds an external identifier (with namespace) to an app user."
  addAppUserExternalId(input: SetAppUserExternalIdMutationInput!): AppUser! @requiresAppRole(roles: [Owner, Administrator, Member])
}

enum AppUserSortField {
  id
  email
  createdAt
  updatedAt
  lastLoggedIn
}

type AppContentAccess {
  canAccess: Boolean!
  isLoggedIn: Boolean!
  hasRequiredAccessLevel: Boolean!
  requiresAccessLevel: Boolean!
  requiredAccessLevels: [AccessLevel]!
  messages: JSON
}

type AppContext {
  application: Application!
  user: AppUser
  mergedAccessLevels: [AccessLevel]
  mergedTeams: [Team]
  hasTeams: Boolean!
  hasUser: Boolean!
}

type AppUser {
  id: String! @projection(localField: "_id")
  email: String! @projection
  domain: String! @projection
  name: String @projection(localField: "givenName", needs: ["familyName"])
  givenName: String @projection
  familyName: String @projection
  displayName: String @projection(localField: "displayName", needs: ["email"])
  region: LocaleRegion @projection(localField: "regionCode", needs: ["countryCode"])
  regionCode: String @projection
  postalCode: String @projection
  country: LocaleCountry @projection(localField: "countryCode")
  countryCode: String @projection
  organization: String @projection
  organizationTitle: String @projection
  accessLevels: [AccessLevel] @projection(localField: "accessLevelIds")
  teams: [Team]  @projection(localField: "teamIds")
  lastLoggedIn: Date @projection
  verified: Boolean @projection
  mustReVerifyProfile: Boolean! @projection(localField: "forceProfileReVerification", needs: ["profileLastVerifiedAt"])
  forceProfileReVerification: Boolean
  profileLastVerifiedAt: Date @projection
  banned: Boolean @projection
  receiveEmail: Boolean @projection
  regionalConsentAnswers: [AppUserRegionalConsentAnswer!]! @projection
  "Shows all answers to custom select questions. By default this will include all questions, even if the user has not answered."
  customSelectFieldAnswers(input: AppUserCustomSelectFieldAnswersInput = {}): [AppUserCustomSelectFieldAnswer!]! @projection
  "Lists all external IDs + namespaces associated with this user."
  externalIds: [AppUserExternalEntityId!]! @projection
  createdAt: Date @projection
  updatedAt: Date @projection
}

type AppUserExternalEntityId {
  id: String!
  identifier: AppUserExternalIdentifier!
  namespace: AppUserExternalNamespace!
}

type AppUserExternalIdentifier {
  value: String!
  type: String
}

type AppUserExternalNamespace {
  provider: String
  tenant: String
  type: String!
}

type AppUserRegionalConsentAnswer {
  id: String!
  given: Boolean
  date: Date!
  policy: OrganizationRegionalConsentPolicy!
}

type AppUserCustomSelectFieldAnswer {
  "The user-to-answer identifier."
  id: String!
  "The custom select field that was answered."
  field: SelectField!
  "Whether the user has answered the question."
  hasAnswered: Boolean!
  "The answered field option(s). This will always be an array, even if the field is a single-select only. An empty value signifies a non, or no longer valid, answer. It's up to the implementing components to account for this."
  answers: [SelectFieldOption!]!
}

type AppUserConnection @projectUsing(type: "AppUser") {
  totalCount: Int!
  edges: [AppUserEdge]!
  pageInfo: PageInfo!
}

type AppUserEdge {
  node: AppUser!
  cursor: String!
}

type AppUserAuthentication {
  user: AppUser!
  token: AppUserAuthToken!
}

type AppUserAuthToken {
  id: String!
  value: String!
}

input AppUserCustomSelectFieldAnswersInput {
  "Only return answers for the provided field IDs. An empty value will return all answers."
  fieldIds: [String!] = []
  "If true, will only return answers the user has set. Otherwise, all questions will be return, with empty answers where not set. This will also be filtered by the fieldIds input."
  onlyAnswered: Boolean = false
  "If true, will only return active questions. This will also be filtered by the fieldIds and onlyAnswered inputs."
  onlyActive: Boolean = false
  "Optionally sort by fields on the custom field."
  sort: FieldInterfaceSortInput = {}
}

input AppUserQueryInput {
  email: String!
}

input AppUsersQueryInput {
  sort: AppUserSortInput = {}
  pagination: PaginationInput = {}
}

input MatchAppUsersQueryInput {
  sort: AppUserSortInput = {}
  pagination: PaginationInput = {}
  field: String!
  phrase: String!
  position: MatchPosition = contains
  excludeIds: [String!] = []
}

input AppUserSortInput {
  field: AppUserSortField = id
  order: SortOrder = desc
}

input CheckContentAccessQueryInput {
  isEnabled: Boolean!
  requiredAccessLevelIds: [String]
}

input CreateAppUserMutationInput {
  email: String!
  givenName: String
  familyName: String
  organization: String
  organizationTitle: String
  countryCode: String
  regionCode: String
  postalCode: String
}

input LoginAppUserMutationInput {
  token: String!
}

input LogoutAppUserMutationInput {
  token: String!
}

input LogoutAppUserWithDataMutationInput {
  token: String!
}

input ManageCreateAppUserMutationInput {
  email: String!
  givenName: String
  familyName: String
  organization: String
  organizationTitle: String
  countryCode: String
  regionCode: String
  postalCode: String
  accessLevelIds: [String!] = []
  teamIds: [String!] = []
}

input SendAppUserLoginLinkMutationInput {
  email: String!
  authUrl: String!
  redirectTo: String
  "If provided, will use the matched application context when sending the login email."
  appContextId: String
  "Deprecated. While this field can still be sent, it is no longer used or handled."
  fields: JSON
}

input SetAppUserBannedMutationInput {
  "The user ID to ban/unban."
  id: String!
  "Whether the user will be banned or not."
  value: Boolean!
}

input SetAppUserExternalIdMutationInput {
  "The user ID to set the external ID to."
  userId: String!
  "The external identifier input."
  identifier: AppUserExternalIdentifierInput!
  "The external namespace input."
  namespace: AppUserExternalNamespaceInput!
}

input AppUserExternalIdentifierInput {
  "The external identifier value."
  value: String!
  "The (optiona) external identifier type - for distinguishing between different types of IDs."
  type: String
}

input AppUserExternalNamespaceInput {
  "The (optional) namespace provider."
  provider: String
  "The (optional) namespace tenant."
  tenant: String
  "The namespace model type."
  type: String!
}

input SetAppUserRegionalConsentMutationInput {
  answers: [SetAppUserRegionalConsentAnswerInput!] = []
}

input SetAppUserRegionalConsentAnswerInput {
  "The region policy identifier to use - must match a regional policy from the Organization."
  policyId: String!
  "Whether consent was given for this region."
  given: Boolean!
}

input SetAppUserUnverifiedDataMutationInput {
  "The email address of the unverified user to set."
  email: String!

  givenName: String
  familyName: String
  organization: String
  organizationTitle: String
  countryCode: String
  regionCode: String
  postalCode: String

  regionalConsentAnswers: [SetAppUserRegionalConsentAnswerInput!] = []
}

input UpdateAppUserPayloadInput {
  email: String!
  givenName: String
  familyName: String
  organization: String
  organizationTitle: String
  countryCode: String
  regionCode: String
  postalCode: String
  accessLevelIds: [String!] = []
  teamIds: [String!] = []
  forceProfileReVerification: Boolean = false
}

input UpdateAppUserMutationInput {
  id: String!
  payload: UpdateAppUserPayloadInput!
}

input UpdateAppUserCustomSelectAnswersMutationInput {
  "The user id to update."
  id: String!
  "The answers to set/update. An empty array will _unset_ all existing answers. A null value will do nothing."
  answers: [UpdateAppUserCustomSelectAnswer!]
}

input UpdateOwnAppUserCustomSelectAnswersMutationInput {
  "The answers to set/update for the current user. An empty array will _unset_ all existing answers. A null value will do nothing."
  answers: [UpdateAppUserCustomSelectAnswer!]
}

input UpdateAppUserCustomSelectAnswer {
  "The custom select field ID."
  fieldId: String!
  "The selected option IDs to select. This must always been an array, even if the question only supports one answer. An empty array will unset any existing options."
  optionIds: [String!]!
}

input UpdateOwnAppUserMutationInput {
  givenName: String
  familyName: String
  organization: String
  organizationTitle: String
  countryCode: String
  regionCode: String
  postalCode: String
  receiveEmail: Boolean
}

`;
