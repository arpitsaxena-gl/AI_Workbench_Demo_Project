const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { MongoClient } = require("mongodb");
const redis = require("redis");
const neo4j = require("neo4j-driver");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGO_DB || "mydb";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";

let mongoDb = null;
let redisClient = null;
let neo4jDriver = null;

async function getMongoDb() {
  if (!mongoDb) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    mongoDb = client.db(MONGO_DB);
  }
  return mongoDb;
}

async function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({ url: REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();
  }
  return redisClient;
}

function getNeo4jDriver() {
  if (!neo4jDriver) {
    neo4jDriver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
    );
  }
  return neo4jDriver;
}

const server = new McpServer({
  name: "multi-db-mcp",
  version: "1.0.0",
});

// --------------- MongoDB Tools ---------------

server.tool(
  "mongo_find",
  "Query documents from a MongoDB collection. Returns matching documents as JSON.",
  {
    collection: z.string().describe("Collection name e.g. users, orders"),
    query: z
      .string()
      .optional()
      .describe('MongoDB filter as JSON string e.g. {"age":{"$gt":25}}'),
    limit: z
      .number()
      .optional()
      .describe("Max documents to return (default 20)"),
    sort: z
      .string()
      .optional()
      .describe('Sort as JSON string e.g. {"createdAt":-1}'),
  },
  async ({ collection, query, limit, sort }) => {
    try {
      const db = await getMongoDb();
      const filter = query ? JSON.parse(query) : {};
      const sortObj = sort ? JSON.parse(sort) : {};
      const docs = await db
        .collection(collection)
        .find(filter)
        .sort(sortObj)
        .limit(limit || 20)
        .toArray();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { count: docs.length, documents: docs },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `MongoDB error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "mongo_insert",
  "Insert one or more documents into a MongoDB collection.",
  {
    collection: z.string().describe("Collection name"),
    documents: z
      .string()
      .describe(
        'JSON string — single object or array of objects e.g. [{"name":"Alice"}]'
      ),
  },
  async ({ collection, documents }) => {
    try {
      const db = await getMongoDb();
      const docs = JSON.parse(documents);
      const result = Array.isArray(docs)
        ? await db.collection(collection).insertMany(docs)
        : await db.collection(collection).insertOne(docs);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `MongoDB error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "mongo_update",
  "Update documents in a MongoDB collection.",
  {
    collection: z.string().describe("Collection name"),
    filter: z
      .string()
      .describe('Filter as JSON string e.g. {"_id":"abc123"}'),
    update: z
      .string()
      .describe('Update operations as JSON string e.g. {"$set":{"status":"active"}}'),
    many: z
      .boolean()
      .optional()
      .describe("If true, update all matching docs (default: first match only)"),
  },
  async ({ collection, filter, update, many }) => {
    try {
      const db = await getMongoDb();
      const filterObj = JSON.parse(filter);
      const updateObj = JSON.parse(update);
      const result = many
        ? await db.collection(collection).updateMany(filterObj, updateObj)
        : await db.collection(collection).updateOne(filterObj, updateObj);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `MongoDB error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "mongo_delete",
  "Delete documents from a MongoDB collection.",
  {
    collection: z.string().describe("Collection name"),
    filter: z
      .string()
      .describe('Filter as JSON string e.g. {"status":"inactive"}'),
    many: z
      .boolean()
      .optional()
      .describe("If true, delete all matching docs (default: first match only)"),
  },
  async ({ collection, filter, many }) => {
    try {
      const db = await getMongoDb();
      const filterObj = JSON.parse(filter);
      const result = many
        ? await db.collection(collection).deleteMany(filterObj)
        : await db.collection(collection).deleteOne(filterObj);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `MongoDB error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "mongo_aggregate",
  "Run an aggregation pipeline on a MongoDB collection.",
  {
    collection: z.string().describe("Collection name"),
    pipeline: z
      .string()
      .describe(
        'Aggregation pipeline as JSON array string e.g. [{"$match":{"status":"active"}},{"$group":{"_id":"$category","total":{"$sum":1}}}]'
      ),
  },
  async ({ collection, pipeline }) => {
    try {
      const db = await getMongoDb();
      const pipelineArr = JSON.parse(pipeline);
      const results = await db
        .collection(collection)
        .aggregate(pipelineArr)
        .toArray();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { count: results.length, results },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `MongoDB error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "mongo_list_collections",
  "List all collections in the connected MongoDB database.",
  {},
  async () => {
    try {
      const db = await getMongoDb();
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => c.name);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ database: MONGO_DB, collections: names }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `MongoDB error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// --------------- Redis Tools ---------------

server.tool(
  "redis_get",
  "Get a value from Redis by key.",
  {
    key: z.string().describe("Redis key e.g. user:123, session:abc"),
  },
  async ({ key }) => {
    try {
      const client = await getRedisClient();
      const value = await client.get(key);
      return {
        content: [
          { type: "text", text: JSON.stringify({ key, value }, null, 2) },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Redis error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "redis_set",
  "Set a key-value pair in Redis with optional TTL.",
  {
    key: z.string().describe("Redis key"),
    value: z.string().describe("Value to store"),
    ttl: z
      .number()
      .optional()
      .describe("Time-to-live in seconds (optional, no expiry if omitted)"),
  },
  async ({ key, value, ttl }) => {
    try {
      const client = await getRedisClient();
      const options = ttl ? { EX: ttl } : {};
      await client.set(key, value, options);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { key, value, ttl: ttl || "none", status: "OK" },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Redis error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "redis_delete",
  "Delete one or more keys from Redis.",
  {
    keys: z
      .string()
      .describe("Comma-separated keys to delete e.g. user:123,session:abc"),
  },
  async ({ keys }) => {
    try {
      const client = await getRedisClient();
      const keyList = keys.split(",").map((k) => k.trim());
      const deleted = await client.del(keyList);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ deletedCount: deleted, keys: keyList }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Redis error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "redis_keys",
  "List Redis keys matching a pattern.",
  {
    pattern: z
      .string()
      .optional()
      .describe('Glob pattern e.g. user:*, session:* (default "*" — all keys)'),
  },
  async ({ pattern }) => {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern || "*");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: keys.length, keys }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Redis error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "redis_hash_get",
  "Get all fields from a Redis hash, or a specific field.",
  {
    key: z.string().describe("Redis hash key"),
    field: z
      .string()
      .optional()
      .describe("Specific field to get (omit to get all fields)"),
  },
  async ({ key, field }) => {
    try {
      const client = await getRedisClient();
      const result = field
        ? await client.hGet(key, field)
        : await client.hGetAll(key);
      return {
        content: [
          { type: "text", text: JSON.stringify({ key, field, result }, null, 2) },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Redis error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "redis_hash_set",
  "Set fields in a Redis hash.",
  {
    key: z.string().describe("Redis hash key"),
    fields: z
      .string()
      .describe('Fields as JSON object string e.g. {"name":"Alice","age":"30"}'),
  },
  async ({ key, fields }) => {
    try {
      const client = await getRedisClient();
      const fieldObj = JSON.parse(fields);
      await client.hSet(key, fieldObj);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ key, fields: fieldObj, status: "OK" }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Redis error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// --------------- Neo4j Tools ---------------

server.tool(
  "neo4j_query",
  "Run a read-only Cypher query against Neo4j. Use for MATCH, RETURN, etc.",
  {
    cypher: z
      .string()
      .describe(
        "Cypher query e.g. MATCH (u:User)-[:FRIEND]->(f:User) RETURN u.name, f.name"
      ),
    params: z
      .string()
      .optional()
      .describe('Query parameters as JSON string e.g. {"userId":"123"}'),
  },
  async ({ cypher, params }) => {
    const session = getNeo4jDriver().session({
      defaultAccessMode: neo4j.session.READ,
    });
    try {
      const parameters = params ? JSON.parse(params) : {};
      const result = await session.run(cypher, parameters);
      const records = result.records.map((r) => r.toObject());
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { count: records.length, records },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Neo4j error: ${err.message}` }],
        isError: true,
      };
    } finally {
      await session.close();
    }
  }
);

server.tool(
  "neo4j_write",
  "Run a write Cypher query against Neo4j. Use for CREATE, MERGE, DELETE, SET, etc.",
  {
    cypher: z
      .string()
      .describe(
        'Cypher write query e.g. CREATE (u:User {name: $name, age: $age})'
      ),
    params: z
      .string()
      .optional()
      .describe('Query parameters as JSON string e.g. {"name":"Alice","age":30}'),
  },
  async ({ cypher, params }) => {
    const session = getNeo4jDriver().session({
      defaultAccessMode: neo4j.session.WRITE,
    });
    try {
      const parameters = params ? JSON.parse(params) : {};
      const result = await session.run(cypher, parameters);
      const summary = result.summary.counters.updates();
      return {
        content: [
          { type: "text", text: JSON.stringify({ summary }, null, 2) },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Neo4j error: ${err.message}` }],
        isError: true,
      };
    } finally {
      await session.close();
    }
  }
);

server.tool(
  "neo4j_schema",
  "Get the schema (labels, relationship types, property keys) from Neo4j.",
  {},
  async () => {
    const session = getNeo4jDriver().session({
      defaultAccessMode: neo4j.session.READ,
    });
    try {
      const [labels, relTypes, propKeys] = await Promise.all([
        session.run("CALL db.labels()"),
        session.run("CALL db.relationshipTypes()"),
        session.run("CALL db.propertyKeys()"),
      ]);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                labels: labels.records.map((r) => r.get(0)),
                relationshipTypes: relTypes.records.map((r) => r.get(0)),
                propertyKeys: propKeys.records.map((r) => r.get(0)),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Neo4j error: ${err.message}` }],
        isError: true,
      };
    } finally {
      await session.close();
    }
  }
);

// --------------- Smart Cache Tool ---------------

server.tool(
  "smart_fetch",
  "Smart fetch: checks Redis cache first, falls back to MongoDB, and caches the result. Best practice pattern for read-heavy workloads.",
  {
    collection: z.string().describe("MongoDB collection name"),
    cacheKey: z
      .string()
      .describe("Redis cache key to check/store e.g. cache:users:active"),
    query: z
      .string()
      .optional()
      .describe('MongoDB filter as JSON string (used on cache miss)'),
    ttl: z
      .number()
      .optional()
      .describe("Cache TTL in seconds (default 300 = 5 min)"),
  },
  async ({ collection, cacheKey, query, ttl }) => {
    try {
      const client = await getRedisClient();
      const cached = await client.get(cacheKey);
      if (cached) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { source: "redis_cache", data: JSON.parse(cached) },
                null,
                2
              ),
            },
          ],
        };
      }

      const db = await getMongoDb();
      const filter = query ? JSON.parse(query) : {};
      const docs = await db
        .collection(collection)
        .find(filter)
        .limit(100)
        .toArray();

      await client.set(cacheKey, JSON.stringify(docs), {
        EX: ttl || 300,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { source: "mongodb_fresh", cached_for: `${ttl || 300}s`, data: docs },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Smart fetch error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// --------------- Start Server ---------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
