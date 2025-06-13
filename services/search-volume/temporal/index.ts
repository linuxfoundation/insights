import { Worker } from '@temporalio/worker';
import { NativeConnection } from '@temporalio/worker';
import * as activities from './activities/searchVolume.js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: resolve(__dirname, './workflows/searchVolume.ts'),
    activities,
    taskQueue: 'search-volume',
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down worker...');
    worker.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down worker...');
    worker.shutdown();
    process.exit(0);
  });

  console.log('Worker started successfully. Press Ctrl+C to stop.');
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

