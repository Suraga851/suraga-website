import type { InterventionEvent, LearningModule } from "@aura-ed/shared-types";
import { MongoClient } from "mongodb";
import { Pool } from "pg";
import Redis from "ioredis";

type HealthFlag = "ok" | "degraded";

type PersistenceHealth = {
  postgres: HealthFlag;
  mongo: HealthFlag;
  redis: HealthFlag;
};

const DEFAULT_POSTGRES_URL = "postgresql://aura:aura@localhost:5432/aura_ed";
const DEFAULT_MONGO_URL = "mongodb://localhost:27017";
const DEFAULT_REDIS_URL = "redis://localhost:6379";

const MODULES_CACHE_KEY = "modules:all:v1";

export class PersistenceLayer {
  private readonly postgres: Pool;
  private readonly mongo: MongoClient;
  private readonly redis: Redis;
  private readonly mongoDbName: string;
  private readonly cacheTtlSeconds: number;
  private healthState: PersistenceHealth = {
    postgres: "degraded",
    mongo: "degraded",
    redis: "degraded"
  };

  constructor() {
    const postgresUrl = process.env.POSTGRES_URL ?? DEFAULT_POSTGRES_URL;
    const mongoUrl = process.env.MONGO_URL ?? DEFAULT_MONGO_URL;
    const redisUrl = process.env.REDIS_URL ?? DEFAULT_REDIS_URL;

    this.mongoDbName = process.env.MONGO_DB_NAME ?? "aura_ed";
    this.cacheTtlSeconds = Number(process.env.REDIS_CACHE_TTL_SECONDS ?? 120);

    this.postgres = new Pool({ connectionString: postgresUrl });
    this.mongo = new MongoClient(mongoUrl);
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 2
    });
  }

  async initialize(seedModules: LearningModule[]): Promise<void> {
    await this.initializePostgres();
    await this.initializeMongo(seedModules);
    await this.initializeRedis();
  }

  getHealth(): PersistenceHealth {
    return this.healthState;
  }

  private async initializePostgres(): Promise<void> {
    try {
      await this.postgres.query(`
        CREATE TABLE IF NOT EXISTS interventions (
          id BIGSERIAL PRIMARY KEY,
          learner_id TEXT NOT NULL,
          support_band TEXT NOT NULL,
          reason TEXT NOT NULL,
          actions JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await this.postgres.query(
        "CREATE INDEX IF NOT EXISTS interventions_created_at_idx ON interventions (created_at DESC)"
      );
      this.healthState.postgres = "ok";
    } catch (error) {
      this.healthState.postgres = "degraded";
      console.error("PostgreSQL initialization failed:", error);
    }
  }

  private async initializeMongo(seedModules: LearningModule[]): Promise<void> {
    try {
      await this.mongo.connect();
      const collection = this.mongo
        .db(this.mongoDbName)
        .collection<LearningModule>("learning_modules");
      const count = await collection.countDocuments();
      if (count === 0) {
        await collection.insertMany(seedModules);
      }
      this.healthState.mongo = "ok";
    } catch (error) {
      this.healthState.mongo = "degraded";
      console.error("Mongo initialization failed:", error);
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      await this.redis.ping();
      this.healthState.redis = "ok";
    } catch (error) {
      this.healthState.redis = "degraded";
      console.error("Redis initialization failed:", error);
    }
  }

  async listModules(fallback: LearningModule[]): Promise<LearningModule[]> {
    const cached = await this.getCachedModules();
    if (cached.length > 0) {
      return cached;
    }

    if (this.healthState.mongo === "ok") {
      try {
        const records = await this.mongo
          .db(this.mongoDbName)
          .collection<LearningModule>("learning_modules")
          .find({})
          .toArray();
        if (records.length > 0) {
          await this.cacheModules(records);
          return records;
        }
      } catch (error) {
        console.error("Mongo module fetch failed:", error);
        this.healthState.mongo = "degraded";
      }
    }

    return fallback;
  }

  async listInterventions(fallback: InterventionEvent[]): Promise<InterventionEvent[]> {
    if (this.healthState.postgres !== "ok") {
      return fallback;
    }

    try {
      const result = await this.postgres.query<{
        learner_id: string;
        support_band: string;
        reason: string;
        actions: string[];
        created_at: Date;
      }>(
        `
          SELECT learner_id, support_band, reason, actions, created_at
          FROM interventions
          ORDER BY created_at DESC
          LIMIT 100
        `
      );

      return result.rows.map((row) => ({
        learnerId: row.learner_id,
        supportBand: row.support_band as InterventionEvent["supportBand"],
        reason: row.reason,
        actions: row.actions,
        createdAtIso: row.created_at.toISOString()
      }));
    } catch (error) {
      console.error("PostgreSQL intervention fetch failed:", error);
      this.healthState.postgres = "degraded";
      return fallback;
    }
  }

  async insertIntervention(event: InterventionEvent): Promise<void> {
    if (this.healthState.postgres !== "ok") {
      throw new Error("PostgreSQL unavailable");
    }

    await this.postgres.query(
      `
        INSERT INTO interventions (learner_id, support_band, reason, actions, created_at)
        VALUES ($1, $2, $3, $4::jsonb, $5::timestamptz)
      `,
      [
        event.learnerId,
        event.supportBand,
        event.reason,
        JSON.stringify(event.actions),
        event.createdAtIso
      ]
    );
  }

  private async getCachedModules(): Promise<LearningModule[]> {
    if (this.healthState.redis !== "ok") {
      return [];
    }

    try {
      const raw = await this.redis.get(MODULES_CACHE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as LearningModule[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Redis cache read failed:", error);
      this.healthState.redis = "degraded";
      return [];
    }
  }

  private async cacheModules(modules: LearningModule[]): Promise<void> {
    if (this.healthState.redis !== "ok") {
      return;
    }

    try {
      await this.redis.set(
        MODULES_CACHE_KEY,
        JSON.stringify(modules),
        "EX",
        this.cacheTtlSeconds
      );
    } catch (error) {
      console.error("Redis cache write failed:", error);
      this.healthState.redis = "degraded";
    }
  }
}
