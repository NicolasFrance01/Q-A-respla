import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oV8I5PJptqdW@ep-small-bonus-aysw707y-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS presentations (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        code VARCHAR(50) NOT NULL,
        created_at BIGINT NOT NULL,
        active_slide_index INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        slides JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS slide_responses (
        id VARCHAR(255) PRIMARY KEY,
        presentation_id VARCHAR(255) NOT NULL,
        slide_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        upvotes INT DEFAULT 1,
        created_at BIGINT NOT NULL,
        is_answered BOOLEAN DEFAULT FALSE,
        is_pinned BOOLEAN DEFAULT FALSE,
        author_alias VARCHAR(100) DEFAULT 'Anónimo'
      );
    `);
    isInitialized = true;
  } finally {
    client.release();
  }
}
