import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # Authentication Types
  type User {
    id: String!
    email: String!
    name: String
    role: String!
    isActive: Boolean!
    organizationId: String
    organization: Organization
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  # Organization Types
  type Organization {
    id: String!
    name: String!
    slug: String!
    domain: String
    logo: String
    primaryColor: String!
    secondaryColor: String!
    plan: String!
    maxUsers: Int!
    maxDevices: Int!
    settings: JSON
    isActive: Boolean!
    users: [User!]!
    devices: [Device!]!
    subscriptions: [OrganizationSubscription!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Device Types
  type Device {
    id: String!
    userId: String
    organizationId: String
    user: User
    organization: Organization
    name: String!
    type: String!
    model: String
    serialNumber: String
    capacity: Float
    status: String!
    location: JSON
    installedAt: DateTime
    readings: [DeviceReading!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DeviceReading {
    id: String!
    deviceId: String!
    device: Device!
    timestamp: DateTime!
    generationKW: Float
    consumptionKW: Float
    batteryPercent: Float
    voltage: Float
    current: Float
    temperature: Float
    efficiency: Float
    metadata: JSON
  }

  # Subscription Types
  type Plan {
    id: String!
    name: String!
    description: String!
    price: Float!
    currency: String!
    features: JSON!
    maxDevices: Int!
    maxStorage: Int!
    priority: Int!
    stripePriceId: String
    active: Boolean!
    subscriptions: [Subscription!]!
    organizationSubscriptions: [OrganizationSubscription!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Subscription {
    id: String!
    userId: String!
    user: User!
    planId: String!
    plan: Plan!
    status: String!
    stripeSubscriptionId: String
    stripeCustomerId: String
    currentPeriodStart: DateTime!
    currentPeriodEnd: DateTime!
    cancelAtPeriodEnd: Boolean!
    canceledAt: DateTime
    invoices: [Invoice!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrganizationSubscription {
    id: String!
    organizationId: String!
    organization: Organization!
    planId: String!
    plan: Plan!
    status: String!
    stripeSubscriptionId: String
    stripeCustomerId: String
    currentPeriodStart: DateTime!
    currentPeriodEnd: DateTime!
    cancelAtPeriodEnd: Boolean!
    canceledAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Billing Types
  type Invoice {
    id: String!
    userId: String
    organizationId: String
    user: User
    organization: Organization
    subscriptionId: String
    subscription: Subscription
    invoiceNumber: String!
    amount: Float!
    currency: String!
    status: String!
    dueDate: DateTime!
    paidAt: DateTime
    stripeInvoiceId: String
    description: String
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Support Types
  type SupportTicket {
    id: String!
    userId: String
    organizationId: String
    user: User
    organization: Organization
    subject: String!
    description: String!
    status: String!
    priority: String!
    category: String
    assignedTo: String
    resolvedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type FAQ {
    id: String!
    question: String!
    answer: String!
    category: String
    order: Int!
    active: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Notification Types
  type Notification {
    id: String!
    userId: String
    organizationId: String
    user: User
    organization: Organization
    title: String!
    message: String!
    type: String!
    read: Boolean!
    link: String
    createdAt: DateTime!
  }

  # Analytics Types
  type EnergyStats {
    totalGeneration: Float!
    totalConsumption: Float!
    netEnergy: Float!
    efficiency: Float!
    costSavings: Float!
    carbonOffset: Float!
    period: String!
  }

  type DeviceStats {
    deviceId: String!
    deviceName: String!
    generation: Float!
    consumption: Float!
    efficiency: Float!
    uptime: Float!
    alerts: Int!
  }

  type AnalyticsData {
    energyStats: EnergyStats!
    deviceStats: [DeviceStats!]!
    trends: JSON!
    predictions: JSON!
  }

  # Input Types
  input LoginInput {
    email: String!
    password: String!
  }

  input DeviceInput {
    name: String!
    type: String!
    model: String
    serialNumber: String
    capacity: Float
    location: JSON
    organizationId: String
  }

  input DeviceReadingInput {
    deviceId: String!
    generationKW: Float
    consumptionKW: Float
    batteryPercent: Float
    voltage: Float
    current: Float
    temperature: Float
    efficiency: Float
    metadata: JSON
  }

  input OrganizationInput {
    name: String!
    slug: String!
    domain: String
    logo: String
    primaryColor: String
    secondaryColor: String
    settings: JSON
  }

  input SupportTicketInput {
    subject: String!
    description: String!
    priority: String
    category: String
    organizationId: String
  }

  input UserInput {
    name: String!
    email: String!
    role: String!
    organizationId: String
    phone: String
  }

  # Filter and Pagination Inputs
  input DeviceFilter {
    type: String
    status: String
    organizationId: String
    userId: String
  }

  input DateRangeFilter {
    startDate: DateTime!
    endDate: DateTime!
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 20
  }

  # Response Types
  type PaginatedResponse {
    data: [JSON!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type SuccessResponse {
    success: Boolean!
    message: String!
  }

  # Root Query Type
  type Query {
    # Authentication
    me: User

    # Organizations
    organizations: [Organization!]!
    organization(id: String!): Organization

    # Devices
    devices(filter: DeviceFilter, pagination: PaginationInput): [Device!]!
    device(id: String!): Device
    deviceReadings(deviceId: String!, dateRange: DateRangeFilter, pagination: PaginationInput): [DeviceReading!]!

    # Users
    users(organizationId: String, pagination: PaginationInput): [User!]!
    user(id: String!): User

    # Plans and Subscriptions
    plans: [Plan!]!
    plan(id: String!): Plan
    subscriptions(userId: String, organizationId: String): [Subscription!]!
    organizationSubscriptions(organizationId: String!): [OrganizationSubscription!]!

    # Analytics
    analytics(organizationId: String, dateRange: DateRangeFilter): AnalyticsData!
    energyStats(organizationId: String, deviceId: String, dateRange: DateRangeFilter): EnergyStats!

    # Billing
    invoices(userId: String, organizationId: String, pagination: PaginationInput): [Invoice!]!
    invoice(id: String!): Invoice

    # Support
    supportTickets(userId: String, organizationId: String, pagination: PaginationInput): [SupportTicket!]!
    supportTicket(id: String!): SupportTicket
    faqs(category: String): [FAQ!]!

    # Notifications
    notifications(userId: String, organizationId: String, pagination: PaginationInput): [Notification!]!
  }

  # Root Mutation Type
  type Mutation {
    # Authentication
    login(input: LoginInput!): AuthPayload!
    logout: SuccessResponse!
    refreshToken: AuthPayload!

    # Organizations
    createOrganization(input: OrganizationInput!): Organization!
    updateOrganization(id: String!, input: OrganizationInput!): Organization!
    deleteOrganization(id: String!): SuccessResponse!

    # Devices
    createDevice(input: DeviceInput!): Device!
    updateDevice(id: String!, input: DeviceInput!): Device!
    deleteDevice(id: String!): SuccessResponse!
    addDeviceReading(input: DeviceReadingInput!): DeviceReading!

    # Users
    createUser(input: UserInput!): User!
    updateUser(id: String!, input: UserInput!): User!
    deleteUser(id: String!): SuccessResponse!
    updateProfile(input: UserInput!): User!

    # Support
    createSupportTicket(input: SupportTicketInput!): SupportTicket!
    updateSupportTicket(id: String!, status: String, assignedTo: String): SupportTicket!
    deleteSupportTicket(id: String!): SuccessResponse!

    # Notifications
    markNotificationAsRead(id: String!): SuccessResponse!
    markAllNotificationsAsRead(userId: String, organizationId: String): SuccessResponse!

    # Subscriptions
    createSubscription(userId: String!, planId: String!): Subscription!
    createOrganizationSubscription(organizationId: String!, planId: String!): OrganizationSubscription!
    cancelSubscription(id: String!): SuccessResponse!
  }

  # Root Subscription Type
  type Subscription {
    # Real-time device data
    deviceReadingsUpdated(deviceId: String): DeviceReading!
    deviceStatusChanged(deviceId: String): Device!

    # Notifications
    notificationAdded(userId: String, organizationId: String): Notification!

    # Organization updates
    organizationUpdated(organizationId: String): Organization!
  }
`;
