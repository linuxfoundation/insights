// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { updateSearchVolume } from "../search-volume/search-volume";
import { ISearchVolumeParams } from "../search-volume/types";
import { svc } from "../main";

export async function runMonthlySearchVolumeUpdate(args: ISearchVolumeParams): Promise<void> {
  try {
    console.log("Starting monthly search volume update...");

    await updateSearchVolume(svc.insightsPostgres.writer, args);

    console.log("Monthly search volume update completed successfully.");
  } catch (error) {
    console.error("Error during monthly search volume update:", error);
    // Rethrow to ensure Temporal handles the failure
    throw error;
  }
}
