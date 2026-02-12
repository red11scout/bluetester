import { MongoClient, Db, Collection, ObjectId } from 'mongodb'

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGODB_DB || 'blueally_aea'

// Collection names
const COLLECTIONS = {
  SESSIONS: 'user_sessions',
  SCENARIOS: 'what_if_scenarios',
  REPORTS: 'saved_reports',
  ANALYTICS: 'usage_analytics',
  COMPANIES: 'companies',
  ASSESSMENTS: 'assessments'
}

// Types for database documents
export interface UserSession {
  _id?: ObjectId
  sessionId: string
  userId?: string
  createdAt: Date
  lastAccessed: Date
  filters: {
    cohort?: string
    quadrant?: string
    track?: string
  }
  scenarios: SavedScenario[]
  settings: {
    theme: 'light' | 'dark'
    sidebarOpen: boolean
  }
}

export interface SavedScenario {
  id: string
  name: string
  description?: string
  assumptions: {
    efficiency: number
    adoption: number
    confidence: number
  }
  createdAt: Date
}

export interface SavedReport {
  _id?: ObjectId
  reportId: string
  sessionId: string
  title: string
  type: 'html' | 'excel' | 'pdf'
  config: Record<string, any>
  createdAt: Date
  expiresAt?: Date
  shareUrl?: string
}

export interface UsageAnalytics {
  _id?: ObjectId
  sessionId: string
  event: string
  metadata: Record<string, any>
  timestamp: Date
}

// Singleton client instance
let client: MongoClient | null = null
let db: Db | null = null

// Connect to MongoDB
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db }
  }

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(DB_NAME)

    // Create indexes for performance
    await createIndexes(db)

    console.log('Connected to MongoDB:', DB_NAME)
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Create necessary indexes
async function createIndexes(db: Db) {
  try {
    // Session indexes
    await db.collection(COLLECTIONS.SESSIONS).createIndex(
      { sessionId: 1 },
      { unique: true }
    )
    await db.collection(COLLECTIONS.SESSIONS).createIndex(
      { lastAccessed: 1 },
      { expireAfterSeconds: 7 * 24 * 60 * 60 } // 7 days TTL
    )

    // Reports indexes
    await db.collection(COLLECTIONS.REPORTS).createIndex(
      { reportId: 1 },
      { unique: true }
    )
    await db.collection(COLLECTIONS.REPORTS).createIndex(
      { sessionId: 1 }
    )
    await db.collection(COLLECTIONS.REPORTS).createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 } // TTL based on expiresAt field
    )

    // Analytics indexes
    await db.collection(COLLECTIONS.ANALYTICS).createIndex(
      { sessionId: 1, timestamp: -1 }
    )
    await db.collection(COLLECTIONS.ANALYTICS).createIndex(
      { event: 1 }
    )
  } catch (error) {
    console.error('Error creating indexes:', error)
  }
}

// Session Management
export async function createSession(sessionId: string): Promise<UserSession> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS)

  const session: UserSession = {
    sessionId,
    createdAt: new Date(),
    lastAccessed: new Date(),
    filters: {},
    scenarios: [],
    settings: {
      theme: 'light',
      sidebarOpen: true
    }
  }

  await collection.insertOne(session)
  return session
}

export async function getSession(sessionId: string): Promise<UserSession | null> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS)

  const session = await collection.findOneAndUpdate(
    { sessionId },
    { $set: { lastAccessed: new Date() } },
    { returnDocument: 'after' }
  )

  return session
}

export async function updateSession(
  sessionId: string,
  updates: Partial<UserSession>
): Promise<UserSession | null> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS)

  const result = await collection.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        ...updates,
        lastAccessed: new Date()
      }
    },
    { returnDocument: 'after' }
  )

  return result
}

export async function saveScenarioToSession(
  sessionId: string,
  scenario: SavedScenario
): Promise<boolean> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS)

  const result = await collection.updateOne(
    { sessionId },
    {
      $push: { scenarios: scenario },
      $set: { lastAccessed: new Date() }
    }
  )

  return result.modifiedCount > 0
}

export async function deleteScenarioFromSession(
  sessionId: string,
  scenarioId: string
): Promise<boolean> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UserSession>(COLLECTIONS.SESSIONS)

  const result = await collection.updateOne(
    { sessionId },
    {
      $pull: { scenarios: { id: scenarioId } },
      $set: { lastAccessed: new Date() }
    }
  )

  return result.modifiedCount > 0
}

// Report Management
export async function saveReport(report: Omit<SavedReport, '_id'>): Promise<SavedReport> {
  const { db } = await connectToDatabase()
  const collection = db.collection<SavedReport>(COLLECTIONS.REPORTS)

  const result = await collection.insertOne(report as SavedReport)
  return { ...report, _id: result.insertedId }
}

export async function getReport(reportId: string): Promise<SavedReport | null> {
  const { db } = await connectToDatabase()
  const collection = db.collection<SavedReport>(COLLECTIONS.REPORTS)

  return collection.findOne({ reportId })
}

export async function getSessionReports(sessionId: string): Promise<SavedReport[]> {
  const { db } = await connectToDatabase()
  const collection = db.collection<SavedReport>(COLLECTIONS.REPORTS)

  return collection
    .find({ sessionId })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function deleteReport(reportId: string): Promise<boolean> {
  const { db } = await connectToDatabase()
  const collection = db.collection<SavedReport>(COLLECTIONS.REPORTS)

  const result = await collection.deleteOne({ reportId })
  return result.deletedCount > 0
}

// Analytics
export async function trackEvent(
  sessionId: string,
  event: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UsageAnalytics>(COLLECTIONS.ANALYTICS)

  await collection.insertOne({
    sessionId,
    event,
    metadata,
    timestamp: new Date()
  })
}

export async function getSessionAnalytics(sessionId: string): Promise<UsageAnalytics[]> {
  const { db } = await connectToDatabase()
  const collection = db.collection<UsageAnalytics>(COLLECTIONS.ANALYTICS)

  return collection
    .find({ sessionId })
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray()
}

// Aggregation queries for portfolio analytics
export async function getPortfolioAnalytics() {
  const { db } = await connectToDatabase()

  // Get session count by day
  const sessionsByDay = await db.collection(COLLECTIONS.ANALYTICS).aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 }
  ]).toArray()

  // Get most common events
  const topEvents = await db.collection(COLLECTIONS.ANALYTICS).aggregate([
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray()

  // Get scenario usage
  const scenarioUsage = await db.collection(COLLECTIONS.SESSIONS).aggregate([
    { $unwind: '$scenarios' },
    {
      $group: {
        _id: null,
        totalScenarios: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    }
  ]).toArray()

  return {
    sessionsByDay,
    topEvents,
    scenarioUsage: scenarioUsage[0] || { totalScenarios: 0, uniqueSessions: [] }
  }
}

// Close connection
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('MongoDB connection closed')
  }
}

// Utility function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
