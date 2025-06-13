// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { Pool } from 'pg';

interface SearchVolumeRecord {
  project_id: string;
  keyword: string;
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

export async function persistSearchVolume(records: SearchVolumeRecord[]): Promise<void> {
  if (records.length === 0) {
    console.log('No records to save to database');
    return;
  }

  const client = getPool();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing records for these projects to ensure we don't have stale data.
    const projectIds = [...new Set(records.map(r => r.project_id))];
    await client.query(
      'DELETE FROM search_volume WHERE project_id = ANY($1)',
      [projectIds]
    );

    const insertQuery = `
      INSERT INTO search_volume (project_id, keyword, data_timestamp, volume)
      VALUES ($1, $2, $3, $4)
    `;
    
    for (const record of records) {
      await client.query(insertQuery, [
        record.project_id,
        record.keyword,
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