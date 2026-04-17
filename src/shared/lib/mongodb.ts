import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL!
const options = {}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

let client: MongoClient

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options)
  }
  client = global._mongoClient
} else {
  client = new MongoClient(uri, options)
}

export async function getDb(): Promise<Db> {
  await client.connect()
  return client.db()
}
