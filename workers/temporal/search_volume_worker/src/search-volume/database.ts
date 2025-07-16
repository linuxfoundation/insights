// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DbStore } from "@crowd/database";
import {DateTime} from "luxon";

export interface SearchVolumeDBRecord {
  insights_project_id: string;
  project: string;
  data_timestamp: DateTime; // Should be in YYYY-MM-DD format
  volume: number;
  updated_at?: string; // Optional since it will be set automatically
}

export async function persistSearchVolume(store: DbStore, records: SearchVolumeDBRecord[]): Promise<void> {
  if (records.length === 0) {
    console.log('No records to save to database');
    return;
  }

  const insertQuery = `
    INSERT INTO search_volume (insights_project_id, project, data_timestamp, volume, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (insights_project_id, project, data_timestamp)
    DO UPDATE SET volume = EXCLUDED.volume, updated_at = EXCLUDED."updated_at"
  `;

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      await store.connection().query(
        insertQuery,
        [
          record.insights_project_id,
          record.project,
          record.data_timestamp,
          record.volume
        ]
      );
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`Error inserting record: `, {
        record: record,
        error: error.message || error
      });
    }
  }

  console.info(`Finished saving search volume data: ${successCount} successful, ${errorCount} failed out of ${records.length} total records.`);
}
