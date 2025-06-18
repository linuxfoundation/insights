// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';

export interface SearchVolumeDBRecord {
  insights_project_id: string;
  slug: string;
  data_timestamp: string; // YYYY-MM-DD
  volume: number;
  updated_at?: string; // Optional since it will be set automatically
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Default connection settings if DATABASE_URL is not provided
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'insights',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }
  return pool;
}

export async function persistSearchVolume(records: SearchVolumeDBRecord[]): Promise<void> {
  if (records.length === 0) {
    console.log('No records to save to database');
    return;
  }

  const client = getPool();
  
  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO search_volume (insights_project_id, slug, data_timestamp, volume)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (insights_project_id, slug, data_timestamp)
      DO UPDATE SET volume = EXCLUDED.volume, updated_at = NOW()
    `;
    
    for (const record of records) {
      await client.query(insertQuery, [
        record.insights_project_id,
        record.slug,
        record.data_timestamp,
        record.volume
      ]);
    }
    
    await client.query('COMMIT');
    console.log(`Successfully saved ${records.length} search volume records to database`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving search volume data to database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
